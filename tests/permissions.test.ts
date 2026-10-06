import { describe, expect, it } from 'vitest';
import { canPerform, isValidInternalReturnUrl, type PermissionUser } from '../src/client/src/auth/permissions';

const requester: PermissionUser = { id: 'employee-1', role: 'EMPLOYEE' };
const manager: PermissionUser = { id: 'manager-1', role: 'MANAGER' };

describe('permissionTable self-approval rule', () => {
  it('denies all approval decisions when the current user is the requester', () => {
    const context = {
      requesterId: requester.id,
      recordInScope: true,
      status: 'Pending Approval'
    };

    expect(canPerform(requester, 'approvePR', context)).toBe(false);
    expect(canPerform(requester, 'rejectPR', context)).toBe(false);
    expect(canPerform(requester, 'requestRevision', context)).toBe(false);
    expect(canPerform(requester, 'sendToFinance', context)).toBe(false);
  });

  it('allows an in-scope manager to decide another requester pending approval', () => {
    expect(canPerform(manager, 'approvePR', {
      requesterId: requester.id,
      recordInScope: true,
      status: 'Pending Approval'
    })).toBe(true);
  });

  it('denies manager approval outside scope or after the pending state', () => {
    expect(canPerform(manager, 'approvePR', {
      requesterId: requester.id,
      status: 'Pending Approval'
    })).toBe(false);
    expect(canPerform(manager, 'approvePR', {
      requesterId: requester.id,
      recordInScope: true,
      status: 'Approved'
    })).toBe(false);
  });

  it('requires explicit assignment for employee Receiving actions', () => {
    expect(canPerform(requester, 'recordReceiving', { assignedReceiverIds: [] })).toBe(false);
    expect(canPerform(requester, 'recordReceiving', { assignedReceiverIds: [requester.id] })).toBe(true);
  });

  it('requires approval history and a selected supplier before PO creation', () => {
    const procurement: PermissionUser = { id: 'proc-1', role: 'PROCUREMENT' };
    expect(canPerform(procurement, 'createPO', { status: 'Comparing', supplierSelected: true })).toBe(false);
    expect(canPerform(procurement, 'createPO', { status: 'Comparing', recordInScope: true, requestApproved: true, supplierSelected: true })).toBe(true);
  });
});

describe('isValidInternalReturnUrl', () => {
  it('accepts internal paths and rejects external redirects', () => {
    expect(isValidInternalReturnUrl('/requests/pr-1')).toBe(true);
    expect(isValidInternalReturnUrl('//attacker.example')).toBe(false);
    expect(isValidInternalReturnUrl('/\\attacker.example')).toBe(false);
    expect(isValidInternalReturnUrl('https://attacker.example')).toBe(false);
  });
});