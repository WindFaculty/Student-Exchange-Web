$dbUrl = $env:DB_URL
$server = "localhost"
$port = 3306
$database = "student_exchange"

if ($dbUrl -and $dbUrl -match "^jdbc:mysql://(?<host>[^/:?]+)(:(?<port>\d+))?/(?<db>[^?;]+)") {
    $server = $Matches["host"]
    if ($Matches["port"]) {
        $port = [int]$Matches["port"]
    }
    $database = $Matches["db"]
}

$user = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "student_exchange_web" }
$password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "wind_faculty" }

Write-Host "Testing connection to MySQL..."
Write-Host "Server: $server"
Write-Host "Port: $port"
Write-Host "Database: $database"
Write-Host "User: $user"

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
$mysqlsh = Get-Command mysqlsh -ErrorAction SilentlyContinue

if (-not $mysql -and -not $mysqlsh) {
    Write-Host "Connection FAILED!" -ForegroundColor Red
    Write-Host "Neither 'mysql' nor 'mysqlsh' was found in PATH." -ForegroundColor Yellow
    exit 1
}

$connected = $false

if ($mysql) {
    $env:MYSQL_PWD = $password
    try {
        & $mysql.Source --host=$server --port=$port --user=$user --database=$database --connect-timeout=5 --execute="SELECT 1;" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $connected = $true
        }
    } finally {
        Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    }
}

if (-not $connected -and $mysqlsh) {
    & $mysqlsh.Source --sql --host=$server --port=$port --user=$user --password=$password --database=$database -e "SELECT 1;" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $connected = $true
    }
}

if ($connected) {
    Write-Host "Connection SUCCESS!" -ForegroundColor Green
} else {
    Write-Host "Connection FAILED!" -ForegroundColor Red
    Write-Host "Verify DB credentials (DB_USERNAME/DB_PASSWORD) or rerun create_user.sql with admin account." -ForegroundColor Yellow
    exit 1
}
