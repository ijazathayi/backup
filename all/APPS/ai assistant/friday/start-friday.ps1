# Friday AI Assistant - Startup Script
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "  FRIDAY AI ASSISTANT v0.2" -ForegroundColor Cyan
Write-Host "  Rust Core + Python Brain + Browser Voice Interface" -ForegroundColor Cyan
Write-Host ""

# Check Rust
$cargo = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $cargo) {
    Write-Host "[ERROR] Rust / Cargo was not found on PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "  1. Go to https://rustup.rs and download rustup-init.exe" -ForegroundColor Yellow
    Write-Host "  2. Run it and follow the prompts (choose default install)" -ForegroundColor Yellow
    Write-Host "  3. CLOSE this window, open a NEW PowerShell, and run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Rust: $(cargo --version)" -ForegroundColor Green

# Check Python
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    $found = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($found) {
        $ver = & $cmd --version 2>&1
        if ($ver -match "Python 3") {
            $pythonCmd = $cmd
            break
        }
    }
}

if (-not $pythonCmd) {
    Write-Host "[ERROR] Python 3 was not found on PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "  1. Go to https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  2. Download Python 3.x and run the installer" -ForegroundColor Yellow
    Write-Host "  3. TICK the box: 'Add python.exe to PATH' on the first screen" -ForegroundColor Yellow
    Write-Host "  4. CLOSE this window, open a NEW PowerShell, and run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Python: $(& $pythonCmd --version)" -ForegroundColor Green

# Install optional Python packages
Write-Host ""
Write-Host "Checking optional Python packages..." -ForegroundColor Cyan

$packages = @("requests", "openai")
foreach ($pkg in $packages) {
    & $pythonCmd -c "import $pkg" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Installing $pkg ..." -ForegroundColor Yellow
        & $pythonCmd -m pip install $pkg --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $pkg installed." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Could not install $pkg. Some features may be unavailable." -ForegroundColor DarkYellow
        }
    } else {
        Write-Host "  [OK] $pkg already available." -ForegroundColor Green
    }
}

# Write real Python path so Rust can find it without hitting the Store stub
$realPython = (Get-Command $pythonCmd).Source
Write-Host "[INFO] Writing Python path: $realPython" -ForegroundColor DarkGray
Set-Content -Path "$PSScriptRoot\python-brain\python_path.txt" -Value $realPython -Encoding UTF8

# Start Friday core
Write-Host ""
Write-Host "[>>] Building and starting Friday core..." -ForegroundColor Green
Write-Host "     First build may take about 30 seconds." -ForegroundColor DarkGray
Write-Host "     Once you see 'Friday Core online', open http://127.0.0.1:7878 in Chrome or Edge." -ForegroundColor Cyan
Write-Host "     Press Ctrl+C to stop Friday." -ForegroundColor DarkGray
Write-Host ""

$env:FRIDAY_PYTHON = $realPython
Set-Location "$PSScriptRoot\rust-core"
cargo run --release

# Keep window open after exit
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Friday core exited with code $LASTEXITCODE." -ForegroundColor Red
    Write-Host "        Read the error messages above." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Friday has stopped. Press Enter to close this window"
