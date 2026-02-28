$server = "localhost"
$port = 3306
$database = "student_exchange"
$user = "student_exchange_web"
$password = "wind_faculty"

Write-Host "Testing connection to MySQL..."
Write-Host "Server: $server"
Write-Host "Port: $port"
Write-Host "Database: $database"
Write-Host "User: $user"

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysql) {
    Write-Host "Connection FAILED!" -ForegroundColor Red
    Write-Host "MySQL CLI ('mysql') was not found in PATH." -ForegroundColor Yellow
    exit 1
}

$env:MYSQL_PWD = $password
try {
    & $mysql.Source --host=$server --port=$port --user=$user --database=$database --connect-timeout=5 --execute="SELECT 1;" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connection SUCCESS!" -ForegroundColor Green
    } else {
        Write-Host "Connection FAILED!" -ForegroundColor Red
    }
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}
