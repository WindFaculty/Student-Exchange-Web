# Local Development Runbook

## Prerequisites
1. Java 25 (`java -version`)
2. Maven Wrapper is included in backend (`apps/backend/mvnw.cmd`)
3. Node.js 18+ (`node -v`)
4. Microsoft SQL Server running on `localhost:1433` (or set `DB_URL`)

## Start backend
```powershell
$env:DB_URL="jdbc:sqlserver://localhost:1433;databaseName=iotdb;encrypt=true;trustServerCertificate=true"
$env:DB_USERNAME="sa"
$env:DB_PASSWORD="<your-password>"
$env:DDL_AUTO="create-drop"
cd apps/backend
.\mvnw.cmd spring-boot:run
```
Backend URL: `http://localhost:8080`

## Start frontend
```powershell
cd apps/frontend
npm install
npm run dev
```
Frontend URL: `http://localhost:5173`

## Test / quality commands
Backend tests:
```powershell
cd apps/backend
.\mvnw.cmd test
```

Frontend lint/build:
```powershell
cd apps/frontend
npm run lint
npm run build
```

## Common issues
1. Java mismatch
   - Ensure Java 25 is installed and active.
2. Maven not found
   - Use `.\mvnw.cmd` instead of global `mvn`.
3. CORS errors in browser
   - Verify backend is running and CORS config allows `http://localhost:5173`.
