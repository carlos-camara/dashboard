$ErrorActionPreference = "Stop"

# Always run from the repo folder where the script lives
Set-Location -Path $PSScriptRoot
Write-Host "Running from: $(Get-Location)"

# Detect Python from .venv or use global
$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }
Write-Host "Using Python: $py"

# Unified reports logic: find most recent folder created today if it's "fresh" (last 10 mins)
$reportsDir = Join-Path $PSScriptRoot "reports"
if (-not (Test-Path $reportsDir)) { New-Item -ItemType Directory -Path $reportsDir | Out-Null }

$recentDir = Get-ChildItem -Path $reportsDir -Directory | 
Where-Object { $_.CreationTime -gt (Get-Date).AddMinutes(-10) } | 
Sort-Object CreationTime -Descending | 
Select-Object -First 1

if ($recentDir) {
    $dir = $recentDir.FullName
    Write-Host "Reusing existing reports folder: $dir"
}
else {
    $ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $dir = Join-Path $reportsDir $ts
    New-Item -ItemType Directory -Force $dir | Out-Null
    Write-Host "Created new reports folder: $dir"
}

# Ensure dependencies are installed
Write-Host "Checking/Installing dependencies..."
& $py -m pip install -r requirements.txt behave-html-formatter --quiet

# Run Behave with both @smoke and @gui tags using multiple --tags for AND logic
Write-Host "Executing GUI Smoke Tests..."
& $py -m behave features --tags=smoke --tags=gui --no-capture --junit --junit-directory $dir

Write-Host "GUI Tests Done. Files created:"
Get-ChildItem -Path $dir
