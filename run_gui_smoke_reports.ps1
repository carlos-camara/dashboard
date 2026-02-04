$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# Detect Python
$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }

Write-Host "Running GUI Smoke Tests via consolidated runner..."
& $py run_tests.py --tags "smoke,gui"

Write-Host "Reports managed by qa-hub-framework."
