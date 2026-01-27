$ErrorActionPreference = "Stop"

# Always run from the repo folder where the script lives
Set-Location -Path $PSScriptRoot
Write-Host "Running from: $(Get-Location)"

# Detect Python from .venv or use global
$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }
Write-Host "Using Python: $py"

# Timestamp folder
$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dir = Join-Path (Join-Path $PSScriptRoot "reports") $ts
New-Item -ItemType Directory -Force $dir | Out-Null
Write-Host "Reports folder: $dir"

# Ensure dependencies are installed
Write-Host "Checking/Installing dependencies..."
& $py -m pip install -r requirements.txt behave-html-formatter --quiet

# Run tests with multiple tags for better compatibility (AND logic)
Write-Host "Executing API Smoke Tests..."
& $py -m behave features --tags=smoke --tags=api --no-capture --junit --junit-directory $dir

Write-Host "Done. Files created:"
Get-ChildItem -Path $dir