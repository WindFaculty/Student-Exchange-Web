# Setup Instructions

## Prerequisites

### 1. Install Java 25
- Download from: https://adoptium.net/ (recommended) or https://www.oracle.com/java/technologies/downloads/
- Install and set JAVA_HOME environment variable
- Verify: `java -version` should show Java 25

### 2. Install Maven

**Option A: Using Chocolatey (Recommended for Windows)**
```powershell
# Install Chocolatey first if not installed: https://chocolatey.org/install
choco install maven
```

**Option B: Manual Installation**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to a folder (e.g., `C:\Program Files\Apache\maven`)
3. Add to PATH:
   - Add `C:\Program Files\Apache\maven\bin` to your PATH environment variable
4. Verify: `mvn -version`

**Option C: Using Scoop**
```powershell
scoop install maven
```

### 3. Verify Installation
```powershell
java -version  # Should show Java 25
mvn -version   # Should show Maven version
```

### 4. Prepare Microsoft SQL Server
- Ensure SQL Server is running and reachable (default: `localhost:1433`)
- Create database: `iotdb`
- Set environment variables for backend:
```powershell
$env:DB_URL="jdbc:sqlserver://localhost:1433;databaseName=iotdb;encrypt=true;trustServerCertificate=true"
$env:DB_USERNAME="sa"
$env:DB_PASSWORD="<your-password>"
$env:DDL_AUTO="create-drop"
```

## Running the Project

### Backend

**Using Maven Wrapper (No Maven installation needed):**
```powershell
cd apps/backend
.\mvnw.cmd spring-boot:run
```

**Or using Maven (if installed):**
```powershell
cd apps/backend
mvn spring-boot:run
```

### Frontend
```powershell
cd apps/frontend
npm install
npm run dev
```

## Alternative: Use IDE

If you prefer using an IDE:
- **IntelliJ IDEA**: Has Maven built-in, just open the project
- **Eclipse**: Install M2E plugin
- **VS Code**: Install Java Extension Pack

## Troubleshooting

### Maven not found
- Make sure Maven is in your PATH
- Restart terminal after installing Maven
- Try: `refreshenv` (if using Chocolatey)

### Java version issues
- Make sure JAVA_HOME points to Java 25
- Check: `echo $env:JAVA_HOME` (PowerShell) or `echo %JAVA_HOME%` (CMD)
