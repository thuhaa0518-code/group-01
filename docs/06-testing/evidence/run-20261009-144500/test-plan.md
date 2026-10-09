# Controlled QA Test Plan

- **Run ID:** `run-20261009-144500`
- **Scope:** Complete project audit & verification across Backend (Django) and Frontend (React/Vite).

## 1. Objectives & Approach
1. Verify static code health (Django system checks, model-migration integrity, ESLint, TypeScript compiler).
2. Execute automated unit and integration test suites present in the repository (`procurement/tests.py`, `tests/workflow.test.js`, `tests/permissions.test.ts`).
3. Verify production artifact buildability (`npm run build`).
4. Perform dependency vulnerability security scan (`npm audit`).
5. Establish an empirical traceability matrix comparing claimed test coverage with actual execution results.

## 2. Test Suites Under Evaluation

| Suite Identifier | Target Scope | Runner / Command | Expected Execution State |
|:---|:---|:---|:---|
| **SUITE-BE-CHECK** | Django System & Settings Integrity | `python manage.py check` | Precheck / Static Analysis |
| **SUITE-BE-MIGRATIONS** | Database Model & Migration Alignment | `python manage.py makemigrations --check --dry-run` | Integrity Verification |
| **SUITE-BE-UNIT** | Django Unit Tests (`procurement/tests.py`) | `python manage.py test` | Backend Unit & Business Rules |
| **SUITE-INTEG-WORKFLOW** | Node.js Workflow Integration Test (`tests/workflow.test.js`) | `node --test tests/workflow.test.js` | Integration Test Suite |
| **SUITE-FE-PERMISSIONS** | Vitest Permissions Test (`tests/permissions.test.ts`) | `vitest` | Security & RBAC Unit Test |
| **SUITE-FE-LINT** | Frontend ESLint Rules | `npm.cmd --prefix FE run lint` | Static Analysis |
| **SUITE-FE-TSC** | Frontend TypeScript Type Checking | `npx.cmd --prefix FE tsc -p FE/tsconfig.json --noEmit` | Static Type Check |
| **SUITE-FE-BUILD** | Frontend Production Build | `npm.cmd --prefix FE run build` | Build Verification |
| **SUITE-SEC-AUDIT** | Dependency Security Scan | `npm.cmd --prefix FE audit` | Security & Vulnerability |

## 3. Execution Safety Constraints
- Read-only execution against development assets.
- No modifications to application source code or dependencies during the audit.
- No irreversible actions or production writes.
