$ErrorActionPreference = "Stop"

# Always run from the repo folder where the script lives
Set-Location -Path $PSScriptRoot
Write-Host "Running GUI Tests from: $(Get-Location)"

# Timestamp folder for GUI reports
$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dir = Join-Path (Join-Path $PSScriptRoot "reports") "gui_$ts"
New-Item -ItemType Directory -Force $dir | Out-Null
Write-Host "GUI Reports folder: $dir"

# Ensure dependencies are handled (pip install in environment or here)
# For local use, we assume dependencies are already installed.

# Run Behave with both @smoke and @gui tags
behave features --tags="smoke and gui" --no-capture --junit --junit-directory $dir

Write-Host "GUI Tests Done. Files created:"
Get-ChildItem -Path $dir
