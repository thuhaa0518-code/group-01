# Defect Log & Findings

- **Run ID:** `run-20261009-144500`
- **Total Defects Identified:** 5

---

### DEFECT-01: Node.js Automated Workflow Test Missing Implementation Modules
- **Severity:** **Blocker**
- **Test ID:** `SUITE-INTEG-WORKFLOW` (`tests/workflow.test.js`)
- **Preconditions:** Node.js v24 installed, run `node --test tests/workflow.test.js`.
- **Expected Result:** Test suite imports server services and executes 6 integration tests against mock/test db.
- **Actual Result:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/server/services/db.service.js'`. The entire `src/` directory in the repository root is empty.
- **Root Cause:** Architectural discrepancy between the Node.js test specification and the Django Python backend implementation. The project backend was built with Django (`procurement/`), but the automated test suite in `tests/workflow.test.js` was written for an Express/Node.js backend.
- **Recommendation:** Implement automated integration tests targeting the actual Django backend endpoints (`/api/v1/state/`, `/api/v1/sync/`) or rewrite the test suite in Python (`procurement/tests.py`).

---

### DEFECT-02: Django Unit Test Suite Fails on Import with Obsolete Model Names
- **Severity:** **Blocker**
- **Test ID:** `SUITE-BE-UNIT` (`procurement/tests.py`)
- **Preconditions:** Python 3.13, Django installed, run `python manage.py test`.
- **Expected Result:** Django test runner initializes in-memory test database and executes unit tests for PR creation, budget calculation, and no-self-approval rule.
- **Actual Result:** `ImportError: cannot import name 'Department' from 'procurement.models'`.
- **Root Cause:** In `procurement/models.py`, `department` is a CharField string attribute, not a standalone model. Similarly, the line item model is named `PRLineItem`, but `tests.py` attempts to import `PRItem`.
- **Recommendation:** Align `procurement/tests.py` with current models in `procurement/models.py` (`PRLineItem`, User fields).

---

### DEFECT-03: Vitest Missing for Security & Permission Tests
- **Severity:** **Major**
- **Test ID:** `SUITE-FE-PERMISSIONS` (`tests/permissions.test.ts`)
- **Preconditions:** Check runner for `tests/permissions.test.ts`.
- **Expected Result:** Vitest runner executes permission table tests.
- **Actual Result:** Vitest is not declared in `package.json` dependencies, and imported file `../src/client/src/auth/permissions` does not exist (`src/` is empty).
- **Root Cause:** Test script references an unmigrated client directory structure.
- **Recommendation:** Port permission test cases into the actual `FE/src/utils/permissions.ts` and configure a test runner in `FE/package.json`.

---

### DEFECT-04: ESLint and Conditional Assignment Errors in Frontend
- **Severity:** **Major**
- **Test ID:** `SUITE-FE-LINT` (`npm run lint` in `FE`)
- **Preconditions:** Run `npm.cmd --prefix FE run lint`.
- **Expected Result:** 0 errors, 0 warnings.
- **Actual Result:** 17 problems (2 errors, 15 warnings).
  - Error 1 (`FE/src/utils/aiStandardizer.ts:72:10`): `Expected a conditional expression and instead saw an assignment` (`no-cond-assign`).
  - Error 2 (`FE/src/contexts/ProcurementContext.tsx:76:22`): `Unexpected empty arrow function` (`@typescript-eslint/no-empty-function`).
- **Root Cause:** While loop assigns regex result directly without enclosing parentheses or eslint disable flag; empty `.catch(() => {})` callback.
- **Recommendation:** Wrap assignment in extra parentheses `while ((m = re.exec(text)))` and handle/comment catch callback.

---

### DEFECT-05: 47 Dependency Vulnerabilities in Frontend NPM Tree
- **Severity:** **Critical** (1 critical, 33 high, 13 moderate)
- **Test ID:** `SUITE-SEC-AUDIT` (`npm audit` in `FE`)
- **Preconditions:** Run `npm.cmd --prefix FE audit`.
- **Expected Result:** 0 vulnerabilities.
- **Actual Result:** 47 vulnerabilities reported, including Critical GHSA in `tar` (file smuggling/DoS) and High GHSA in `minimatch`, `smol-toml`, `js-yaml`, and `path-to-regexp`.
- **Root Cause:** Outdated transitive dependencies brought by `@vercel/python`, `@vercel/rust`, and older tooling.
- **Recommendation:** Review dependency tree, update `vercel` and related dev packages once authorized.
