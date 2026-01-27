# PowerShell script to create SQLite database schema
# Usage: .\create-schema.ps1

Write-Host "🔧 Creating TRAVELLO SQLite Database Schema..." -ForegroundColor Cyan

# Check if database file exists
$dbPath = ".\travello.db"
$sqlPath = ".\quick-setup.sql"

if (-not (Test-Path $sqlPath)) {
    Write-Host "❌ Error: quick-setup.sql not found!" -ForegroundColor Red
    exit 1
}

# Try to find SQLite3
$sqlitePaths = @(
    "sqlite3",
    "C:\ProgramData\chocolatey\bin\sqlite3.exe",
    "C:\Program Files\SQLite\sqlite3.exe",
    "C:\sqlite3.exe"
}

$sqliteCmd = $null
foreach ($path in $sqlitePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $sqliteCmd = $path
        break
    }
}

if (-not $sqliteCmd) {
    Write-Host "❌ SQLite3 not found. Please install SQLite3 first:" -ForegroundColor Red
    Write-Host "   1. Download from: https://sqlite.org/download.html" -ForegroundColor Yellow
    Write-Host "   2. Or install with Chocolatey: choco install sqlite" -ForegroundColor Yellow
    Write-Host "   3. Or use DBeaver to run the schema manually" -ForegroundColor Yellow
    exit 1
}

# Create database schema
try {
    Write-Host "📝 Executing schema from quick-setup.sql..." -ForegroundColor Green
    & $sqliteCmd $dbPath ".read $sqlPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema created successfully!" -ForegroundColor Green
        Write-Host "📍 Database: $((Get-Item $dbPath).FullName)" -ForegroundColor Cyan
        
        # Show tables
        Write-Host "📊 Created tables:" -ForegroundColor Yellow
        & $sqliteCmd $dbPath ".tables"
        
    } else {
        Write-Host "❌ Error creating database schema!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Open DBeaver" -ForegroundColor White
Write-Host "   2. Connect to: $((Get-Item $dbPath).FullName)" -ForegroundColor White
Write-Host "   3. Create ERD: Database → ER Diagrams → Create ER Diagram" -ForegroundColor White
