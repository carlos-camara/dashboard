$ErrorActionPreference = "Stop"

# Always run from the repo folder where the script lives
Set-Location -Path $PSScriptRoot
Write-Host "Running from: $(Get-Location)"

# Timestamp folder
$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dir = Join-Path (Join-Path $PSScriptRoot "reports") $ts
New-Item -ItemType Directory -Force $dir | Out-Null
Write-Host "Reports folder: $dir"

# Ensure HTML formatter is installed (robust against pip warnings)
try {
  python -m pip show behave-html-formatter 2>&1 | Out-Null
  $installed = ($LASTEXITCODE -eq 0)
}
catch {
  $installed = $false
}

if (-not $installed) {
  Write-Host "Installing behave-html-formatter..."
  python -m pip install behave-html-formatter
}

# JUnit
behave features --tags="smoke and api" --no-capture --junit --junit-directory $dir

Write-Host "Done. Files created:"
Get-ChildItem -Path $dir