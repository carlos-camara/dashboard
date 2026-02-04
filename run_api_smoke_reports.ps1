$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }

Write-Host "Running API Smoke Tests via consolidated runner..."
& $py run_tests.py --tags "smoke,api"

Write-Host "Reports managed by qa-hub-framework."