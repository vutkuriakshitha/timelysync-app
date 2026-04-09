if (-not $env:MONGODB_URI -or [string]::IsNullOrWhiteSpace($env:MONGODB_URI)) {
    Write-Host "MONGODB_URI is not set." -ForegroundColor Red
    Write-Host "Set it before starting the backend, for example:" -ForegroundColor Yellow
    Write-Host '$env:MONGODB_URI="your-mongodb-connection-string"' -ForegroundColor Cyan
    exit 1
}

mvn spring-boot:run
