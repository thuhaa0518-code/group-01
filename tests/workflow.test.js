import test from 'node:test';
import assert from 'node:assert';
import { db } from '../src/server/services/db.service.js';
import { submitPR, approvePR, rejectPR, createPO, receiveGoods, closePR, WORKFLOW_STATES } from '../src/server/services/workflow.service.js';
import { normalizePRWithAI, compareQuotationsWithAI } from '../src/server/services/ai.service.js';

test('ProcureAI Procurement Workflow & AI Feature Automated Integration Test Suite', async (t) => {
  // Reset test DB file to clean initial state
  db.saveData({
    departments: [
      { id: 'dept-it', code: 'IT', name: 'Information Technology' },
      { id: 'dept-hr', code: 'HR', name: 'Human Resources' }
    ],
    users: [
      { id: 'usr-emp-01', email: 'employee.it@company.com', fullName: 'Nguyen Van A', role: 'EMPLOYEE', departmentId: 'dept-it' },
      { id: 'usr-mgr-01', email: 'manager.it@company.com', fullName: 'Tran Thi B', role: 'MANAGER', departmentId: 'dept-it' },
      { id: 'usr-pro-01', email: 'procurement@company.com', fullName: 'Le Van C', role: 'PROCUREMENT', departmentId: 'dept-pro' }
    ],
    budgets: [
      { id: 'bgt-it-2026', departmentId: 'dept-it', fiscalYear: 2026, allocatedAmount: 500000000, spentAmount: 0, reservedAmount: 0 }
    ],
    suppliers: [
      { id: 'sup-01', code: 'SUP-PV', name: 'Phong Vũ IT' },
      { id: 'sup-02', code: 'SUP-FPT', name: 'FPT Trading' }
    ],
    purchaseRequests: [],
    prItems: [],
    quotations: [],
    purchaseOrders: [],
    receivings: [],
    auditLogs: []
  });

  const mockEmployee = { id: 'usr-emp-01', fullName: 'Nguyen Van A', role: 'EMPLOYEE', departmentId: 'dept-it' };
  const mockManager = { id: 'usr-mgr-01', fullName: 'Tran Thi B', role: 'MANAGER', departmentId: 'dept-it' };
  const mockProcurement = { id: 'usr-pro-01', fullName: 'Le Van C', role: 'PROCUREMENT', departmentId: 'dept-pro' };

  await t.test('1. Create Draft PR & AI Normalizer Test', async () => {
    const aiRes = await normalizePRWithAI('cần mua 3 cái lap dell', [{ itemName: 'Dell Laptop', quantity: 3, unitPrice: 20000000 }]);
    assert.strictEqual(aiRes.success, true);
    assert.strictEqual(aiRes.data.suggestedCategory, 'IT Equipment');

    const pr = db.insert('purchaseRequests', {
      id: 'pr-test-101',
      prNumber: 'PR-TEST-101',
      title: 'Mua sắm 03 Laptop Dell',
      category: 'IT Equipment',
      requesterId: mockEmployee.id,
      departmentId: 'dept-it',
      totalEstimatedAmount: 60000000,
      status: WORKFLOW_STATES.DRAFT,
      requiresFinanceApproval: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    assert.strictEqual(pr.status, WORKFLOW_STATES.DRAFT);
  });

  await t.test('2. Submit PR & Budget Threshold Flag Test (>50M)', async () => {
    const submittedPR = submitPR('pr-test-101', mockEmployee);
    assert.strictEqual(submittedPR.status, WORKFLOW_STATES.SUBMITTED);
    assert.strictEqual(submittedPR.requiresFinanceApproval, true);
  });

  await t.test('3. Strict No Self-Approval Security Rule Guard Test', async () => {
    // Attempt self approval: should throw error
    assert.throws(() => {
      approvePR('pr-test-101', mockEmployee);
    }, /No Self-Approval/);
  });

  await t.test('4. Manager Approval Test', async () => {
    const approvedPR = approvePR('pr-test-101', mockManager, 'Phê duyệt cấp phòng ban');
    assert.strictEqual(approvedPR.status, WORKFLOW_STATES.APPROVED);
  });

  await t.test('5. AI Quotation Comparison & Price Anomaly Alert Test (≥20%)', async () => {
    db.insert('quotations', {
      id: 'quote-t1',
      prId: 'pr-test-101',
      supplierId: 'sup-01',
      totalAmount: 58000000,
      warrantyMonths: 24,
      deliveryDays: 3
    });

    db.insert('quotations', {
      id: 'quote-t2',
      prId: 'pr-test-101',
      supplierId: 'sup-02',
      totalAmount: 75000000, // 25% higher than 60M budget (Trigger Anomaly!)
      warrantyMonths: 12,
      deliveryDays: 7
    });

    const aiResult = await compareQuotationsWithAI('pr-test-101', ['quote-t1', 'quote-t2']);
    assert.strictEqual(aiResult.success, true);
    assert.strictEqual(aiResult.data.recommendedQuotationId, 'quote-t1');
    assert.strictEqual(aiResult.data.anomalyAlerts.length, 1);
    assert.match(aiResult.data.anomalyAlerts[0].message, /CẢNH BÁO GIÁ BẤT THƯỜNG/);
  });

  await t.test('6. Create PO -> Goods Receiving -> Close PR Lifecycle Test', async () => {
    const po = createPO('pr-test-101', 'quote-t1', mockProcurement);
    assert.strictEqual(po.status, 'ISSUED');

    const prAfterPO = db.findOne('purchaseRequests', p => p.id === 'pr-test-101');
    assert.strictEqual(prAfterPO.status, WORKFLOW_STATES.PO_CREATED);

    const receiving = receiveGoods(po.id, 1, mockEmployee, 'Nhận đủ 3 laptop');
    assert.strictEqual(receiving.status, 'FULL');

    const prAfterReceive = db.findOne('purchaseRequests', p => p.id === 'pr-test-101');
    assert.strictEqual(prAfterReceive.status, WORKFLOW_STATES.RECEIVED);

    const closedPR = closePR('pr-test-101', mockProcurement);
    assert.strictEqual(closedPR.status, WORKFLOW_STATES.CLOSED);
  });
});
