# Environment Summary

- **Run ID:** `run-20261009-144500`
- **Execution Timestamp:** 2026-10-09T14:45:00+07:00
- **Auditor Role:** Senior QA Engineer & QA Automation Engineer
- **Host OS:** Windows (Shell: PowerShell)
- **Repository Root:** `D:\LTUD\group-01 - LTUDDN`
- **Git Branch:** `main`
- **HEAD Commit:** `224a7e8ebdbd9be1b74ed09c0e4aad8b62818279`
- **Working Tree State:** Clean (only `db.sqlite3` runtime tracking)

## Runtime & Tooling Versions

| Tool / Runtime | Version | Notes |
|:---|:---|:---|
| **Python** | 3.13.2 | CPython 64-bit |
| **Django** | 4.2.8 | Installed in system Python environment |
| **Node.js** | v24.10.0 | System Node runtime |
| **npm** | 11.6.1 | Windows npm.cmd |
| **TypeScript (tsc)** | 5.9.3 | via `npx tsc` |
| **ESLint** | 8.50.0 | FE devDependency |
| **Vite** | 5.2.0 (running v5.4.21) | FE build tool |
| **Database** | SQLite 3 (`db.sqlite3`) | Local development database |

## Environment Variables & Secrets Handling
- No production credentials used.
- No secret tokens or keys exposed in execution logs.
- Test database isolation: Standard Django test runner creates isolated `test_db.sqlite3` during `manage.py test`.
