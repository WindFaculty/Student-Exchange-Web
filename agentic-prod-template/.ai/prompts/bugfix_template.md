# Bugfix Template (Paste into Antigravity/Codex)

Bug report:
- <Symptom>
- <Expected vs actual>
- <Steps to reproduce>

Required:
1. Locate the code path (file paths + functions)
2. Root cause hypothesis
3. Minimal fix
4. Add/adjust tests
5. Run checks:
   - `cd apps/backend && .\mvnw.cmd test` (if backend touched)
   - `cd apps/frontend && npm run lint && npm run build` (if frontend touched)
6. Provide a short risk assessment
