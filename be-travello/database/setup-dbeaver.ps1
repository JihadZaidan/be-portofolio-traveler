# TRAVELLO Database Setup for DBeaver
# Version 2.0 - Enhanced Setup Script
param(
    [switch]$Force,
    [switch]$Verbose
)

# Enable verbose output if parameter is set
if ($Verbose) {
    $VerbosePreference = "Continue"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TRAVELLO Database Setup for DBeaver" -ForegroundColor Cyan
Write-Host "         Enhanced Version 2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$dbPath = ".\travello.db"
$backupPath = ".\travello.backup.db"
$sqlFiles = @("quick-setup.sql", "insert-users.sql", "create-tables.sql")
$requiredFiles = @("dbeaver-user-setup.md", "setup-dbeaver.ps1")

# Function to write colored status messages
function Write-Status {
    param([string]$Message, [string]$Status = "Info")
    $color = switch ($Status) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        "Info" { "White" }
        "Cyan" { "Cyan" }
        default { "White" }
    }
    Write-Host $Message -ForegroundColor $color
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to validate SQL file syntax (basic check)
function Test-SqlFile {
    param([string]$FilePath)
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    $basicChecks = @("CREATE TABLE", "INSERT INTO", "PRIMARY KEY")
    
    foreach ($check in $basicChecks) {
        if ($content -notmatch [regex]::Escape($check)) {
            Write-Verbose "SQL validation warning: '$check' not found in $FilePath"
        }
    }
    return $true
}

# Check prerequisites
Write-Status "[PREREQUISITE CHECK] Verifying setup requirements..." "Info"
Write-Host "   Checking PowerShell version..." -ForegroundColor Gray
Write-Host "   PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor White

if (-not (Test-Administrator)) {
    Write-Status "   Running with standard user privileges" "Warning"
} else {
    Write-Status "   Running with administrator privileges" "Success"
}

Write-Host ""

# Step 1: Database file management
Write-Status "[1/5] Database file management..." "Warning"

if (Test-Path $dbPath) {
    $fileInfo = Get-Item $dbPath
    $sizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
    $lastModified = $fileInfo.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    
    Write-Host "   ✓ Database file found:" -ForegroundColor Green
    Write-Host "     Path: $dbPath" -ForegroundColor White
    Write-Host "     Size: $sizeKB KB" -ForegroundColor White
    Write-Host "     Last Modified: $lastModified" -ForegroundColor White
    
    if ($Force) {
        Write-Host "   Creating backup before proceeding..." -ForegroundColor Yellow
        Copy-Item $dbPath $backupPath -Force
        Write-Status "   ✓ Backup created: $backupPath" "Success"
    }
} else {
    Write-Status "   Database file not found!" "Error"
    Write-Host "   Creating new database file..." -ForegroundColor Yellow
    
    try {
        New-Item $dbPath -ItemType File -Force | Out-Null
        Write-Status "   ✓ Database file created successfully" "Success"
    } catch {
        Write-Status "   ✗ Failed to create database file: $($_.Exception.Message)" "Error"
        exit 1
    }
}
Write-Host ""

# Step 2: Validate required files
Write-Status "[2/5] Validating required files..." "Warning"
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        $fileInfo = Get-Item $file
        Write-Host "   ✓ $file ($([math]::Round($fileInfo.Length / 1KB, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Missing: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Status "   ✗ Missing $($missingFiles.Count) required files!" "Error"
    exit 1
}
Write-Host ""

# Step 3: Validate SQL files
Write-Status "[3/5] Validating SQL files..." "Warning"
$sqlFileCount = 0

foreach ($sqlFile in $sqlFiles) {
    if (Test-Path $sqlFile) {
        if (Test-SqlFile -FilePath $sqlFile) {
            $fileInfo = Get-Item $sqlFile
            Write-Host "   ✓ $sqlFile ($([math]::Round($fileInfo.Length / 1KB, 2)) KB)" -ForegroundColor Green
            $sqlFileCount++
        } else {
            Write-Host "   ⚠ $sqlFile (validation warnings)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   - $sqlFile (not found)" -ForegroundColor Gray
    }
}

if ($sqlFileCount -eq 0) {
    Write-Status "   ⚠ No SQL files found for database setup" "Warning"
}
Write-Host ""

# Step 4: List all database-related files
Write-Status "[4/5] Database files inventory..." "Warning"
$allFiles = Get-ChildItem *.sql, *.md, *.db, *.json, *.ps1 | Sort-Object Name

if ($allFiles.Count -gt 0) {
    Write-Host "   Found $($allFiles.Count) database-related files:" -ForegroundColor White
    $allFiles | ForEach-Object {
        $size = if ($_.Length -gt 1MB) { 
            "$([math]::Round($_.Length / 1MB, 2)) MB" 
        } elseif ($_.Length -gt 1KB) { 
            "$([math]::Round($_.Length / 1KB, 2)) KB" 
        } else { 
            "$($_.Length) bytes" 
        }
        
        $icon = switch ($_.Extension) {
            ".sql" { "[SQL]" }
            ".md" { "[GUIDE]" }
            ".db" { "[DB]" }
            ".json" { "[CONFIG]" }
            ".ps1" { "[SCRIPT]" }
            default { "[FILE]" }
        }
        
        $status = if ($_.Name -eq "travello.db") { " (ACTIVE)" } else { "" }
        Write-Host "   $icon $($_.Name.PadRight(30)) $size$status" -ForegroundColor White
    }
} else {
    Write-Status "   No database files found!" "Error"
}
Write-Host ""

# Step 5: Setup instructions
Write-Status "[5/5] Setup instructions..." "Warning"
Write-Host "   Follow these steps in DBeaver:" -ForegroundColor White
Write-Host ""
Write-Host "   1. Open DBeaver Database Manager" -ForegroundColor Cyan
Write-Host "   2. Click 'Database' → 'New Database Connection'" -ForegroundColor White
Write-Host "   3. Select 'SQLite' from the database list" -ForegroundColor White
Write-Host "   4. Browse to: database\travello.db" -ForegroundColor Yellow
Write-Host "   5. Test connection and click 'Finish'" -ForegroundColor White
Write-Host ""
Write-Host "   Then run these SQL scripts in order:" -ForegroundColor Cyan
foreach ($sqlFile in $sqlFiles) {
    if (Test-Path $sqlFile) {
        Write-Host "   • database\$sqlFile" -ForegroundColor White
    }
}
Write-Host ""

# User information
Write-Status "Default user accounts that will be created:" "Cyan"
$users = @(
    @{ Username = "testuser"; Email = "test@example.com"; Role = "Test User" },
    @{ Username = "wrm23r13rn"; Email = "wrm23r13rn@yahoo.com"; Role = "Regular User" },
    @{ Username = "imanueladmojo"; Email = "admjrevo@gmail.com"; Role = "Regular User" }
)

foreach ($user in $users) {
    Write-Host "   • $($user.Username) ($($user.Email)) - $($user.Role)" -ForegroundColor White
}
Write-Host ""

# Additional information
Write-Status "Additional resources:" "Cyan"
Write-Host "   • Guide: database\dbeaver-user-setup.md" -ForegroundColor White
Write-Host "   • Config: database.json" -ForegroundColor White
Write-Host "   • Environment: .env.example" -ForegroundColor White
Write-Host ""

# Final status
Write-Status "✓ Database setup preparation completed successfully!" "Success"
Write-Host ""

if ($Force) {
    Write-Status "Note: Force mode was used - backup created at $backupPath" "Warning"
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
