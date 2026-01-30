# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet

# Reports Directory
$reportsDir = Join-Path $PSScriptRoot "reports\performance_run"
if (-not (Test-Path $reportsDir)) { 
    New-Item -ItemType Directory -Path $reportsDir | Out-Null 
}

# Generate Run ID and Directory
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$runDir = Join-Path $reportsDir "performance_$timestamp"
New-Item -ItemType Directory -Path $runDir | Out-Null

$reportFile = Join-Path $runDir "report.html"

# Detect Python from .venv or use global
$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }
Write-Host "Using Python: $py"

# Start Locust in Headless Mode (Automated) with HTML + JSON Report
Write-Host "Starting Locust Load Test..." -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "Users: 10" -ForegroundColor Yellow
Write-Host "Spawn Rate: 1 user/sec" -ForegroundColor Yellow
Write-Host "Duration: 30 seconds" -ForegroundColor Yellow
Write-Host "Report: $reportFile" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

# --headless: No UI
# -u 10: 10 Users
# -r 1: 1 user per second spawn rate
# --run-time 30s: Run for 30 seconds then stop
# --host: Target server
# --html: Generate HTML report
# --json: Generate JSON stats
& $py -m locust -f performance/locustfile.py --headless -u 10 -r 1 --run-time 30s --host=http://localhost:3001 --html "$reportFile" --csv "$runDir\locust"

Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "Load Test Finished!" -ForegroundColor Green
Write-Host "Report saved at: $reportFile" -ForegroundColor Cyan
