import { useMemo, useState } from 'react';
import type { LineItem, PRInput, PurchaseRequest, User } from '../types/procurement';
import { useProcurement } from '../contexts/ProcurementContext';
import type { AISuggestion } from '../utils/aiStandardizer';
import { budgetCheck, prTotal, validatePR } from '../utils/rules';

const newItemId = () => `i-${Math.random().toString(36).slice(2, 8)}`;

function emptyItem(): LineItem {
  return { id: newItemId(), name: '', specs: '', quantity: 1, unit: 'chiếc', estUnitPrice: 0 };
}

function toInput(pr: PurchaseRequest): PRInput {
  const { title, justification, department, costCenter, category, budgetCode, requiredBy, deliveryLocation, items, aiReview } = pr;
  return { title, justification, department, costCenter, category, budgetCode, requiredBy, deliveryLocation, items: items.map((i) => ({ ...i })), aiReview };
}

export function useRequestForm(user: User, existing?: PurchaseRequest) {
  const { state } = useProcurement();
  const deptBudgets = state.budgets.filter((b) => b.department === user.department);

  const [values, setValues] = useState<PRInput>(() =>
  existing ?
  toInput(existing) :
  {
    title: '',
    justification: '',
    department: user.department,
    costCenter: deptBudgets[0]?.costCenter ?? '',
    category: '',
    budgetCode: deptBudgets[0]?.code ?? '',
    requiredBy: '',
    deliveryLocation: '',
    items: [emptyItem()],
    aiReview: 'none'
  }
  );
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => validatePR(values), [values]);
  const visibleErrors = showErrors ? errors : {};

  const markEdited = (prev: PRInput): PRInput['aiReview'] => prev.aiReview === 'accepted' ? 'edited' : prev.aiReview;

  const setField = <K extends keyof PRInput,>(key: K, value: PRInput[K]) =>
  setValues((prev) => ({ ...prev, [key]: value, aiReview: markEdited(prev) }));

  const setBudgetCode = (code: string) => {
    const b = deptBudgets.find((x) => x.code === code);
    setValues((prev) => ({ ...prev, budgetCode: code, costCenter: b?.costCenter ?? prev.costCenter }));
  };

  const updateItem = (id: string, patch: Partial<LineItem>) =>
  setValues((prev) => ({ ...prev, items: prev.items.map((i) => i.id === id ? { ...i, ...patch } : i), aiReview: markEdited(prev) }));

  const addItem = () => setValues((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (id: string) => setValues((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

  const applySuggestion = (s: AISuggestion) =>
  setValues((prev) => ({
    ...prev,
    title: s.title,
    category: s.category,
    justification: prev.justification.trim() ? prev.justification : s.justification,
    items: s.items.map((i) => ({ id: newItemId(), name: i.name, specs: i.specs, quantity: i.quantity, unit: i.unit, estUnitPrice: 0 })),
    aiReview: 'accepted'
  }));

  const dismissSuggestion = () => setValues((prev) => ({ ...prev, aiReview: prev.aiReview === 'none' ? 'dismissed' : prev.aiReview }));

  const total = prTotal(values);
  const budget = state.budgets.find((b) => b.code === values.budgetCode);
  const check = budgetCheck(total, budget);

  return {
    values,
    errors,
    visibleErrors,
    showErrors,
    setShowErrors,
    setField,
    setBudgetCode,
    updateItem,
    addItem,
    removeItem,
    applySuggestion,
    dismissSuggestion,
    total,
    budget,
    check,
    deptBudgets,
    categories: state.categories
  };
}