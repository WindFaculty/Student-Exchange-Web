$server = "localhost"
$database = "student_exchange"
$user = "student_exchange_web"
$password = "wind_faculty"

$connectionString = "Server=$server;Database=$database;User Id=$user;Password=$password;TrustServerCertificate=True;"

Write-Host "Testing connection to SQL Server..."
Write-Host "Server: $server"
Write-Host "Database: $database"
Write-Host "User: $user"

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    Write-Host "Connection SUCCESS!" -ForegroundColor Green
    $connection.Close()
}
catch {
    Write-Host "Connection FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
