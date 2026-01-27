# TRAVELLO Database Setup for DBeaver
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TRAVELLO Database Setup for DBeaver" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check database file
$dbPath = ".\travello.db"
Write-Host "[1/3] Checking database file..." -ForegroundColor Yellow
if (Test-Path $dbPath) {
    $fileInfo = Get-Item $dbPath
    Write-Host "Database file found: $($fileInfo.Length) bytes" -ForegroundColor Green
} else {
    Write-Host "Database file not found!" -ForegroundColor Red
    Write-Host "Creating new database file..."
    New-Item $dbPath -ItemType File -Force | Out-Null
    Write-Host "Database file created" -ForegroundColor Green
}
Write-Host ""

# List available files
Write-Host "[2/3] Database files ready:" -ForegroundColor Yellow
Get-ChildItem *.sql, *.md, *.db | ForEach-Object {
    $icon = switch ($_.Extension) {
        ".sql" { "[SQL]" }
        ".md" { "[GUIDE]" }
        ".db" { "[DB]" }
        default { "[FILE]" }
    }
    Write-Host "   $icon $($_.Name)" -ForegroundColor White
}
Write-Host ""

# Next steps
Write-Host "[3/3] Next steps:" -ForegroundColor Yellow
Write-Host "   1. Open DBeaver" -ForegroundColor White
Write-Host "   2. Create new SQLite connection to: database\travello.db" -ForegroundColor White
Write-Host "   3. Run database\quick-setup.sql in SQL Editor" -ForegroundColor White
Write-Host "   4. Run database\insert-users.sql in SQL Editor" -ForegroundColor White
Write-Host ""

Write-Host "User data to be inserted:" -ForegroundColor Cyan
Write-Host "   * testuser (test@example.com)" -ForegroundColor White
Write-Host "   * wrm23r13rn (wrm23r13rn@yahoo.com)" -ForegroundColor White
Write-Host "   * imanueladmojo (admjrevo@gmail.com)" -ForegroundColor White
Write-Host ""

Write-Host "For detailed guide, open: database\dbeaver-user-setup.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setup files are ready! Please follow the steps in DBeaver." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
