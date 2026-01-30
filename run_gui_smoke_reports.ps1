$ErrorActionPreference = "Stop"

# Always run from the repo folder where the script lives
Set-Location -Path $PSScriptRoot
Write-Host "Running from: $(Get-Location)"

# Detect Python from .venv or use global
$py = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }
Write-Host "Using Python: $py"

# Ensure dependencies are installed
Write-Host "Checking/Installing dependencies..."
& $py -m pip install -r requirements.txt behave-html-formatter --quiet

# Temporary directory for intermediate results
$tempDir = Join-Path $PSScriptRoot "temp_junit_gui"
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force $tempDir | Out-Null

# Run tests
Write-Host "Executing GUI Smoke Tests..."
& $py -m behave features --tags=smoke --tags=gui --no-capture --junit --junit-directory $tempDir

# Process generated files
$reportsBase = Join-Path $PSScriptRoot "reports\test_run"
if (-not (Test-Path $reportsBase)) { New-Item -ItemType Directory -Path $reportsBase | Out-Null }

$xmlFiles = Get-ChildItem -Path $tempDir -Filter "TESTS-*.xml"
if ($xmlFiles.Count -eq 0) {
    Write-Host "No GUI tests were executed matching the tags."
    return
}

# Group files by project (prefix after TESTS-)
foreach ($file in $xmlFiles) {
    $projectName = "unknown"
    if ($file.Name -match "TESTS-([^.]+)") {
        $projectName = $Matches[1]
    }
    
    # Find or create a project-specific report folder
    $recentDir = Get-ChildItem -Path $reportsBase -Directory | 
    Where-Object { $_.Name -like "$projectName`_*" -and $_.CreationTime -gt (Get-Date).AddMinutes(-10) } | 
    Sort-Object CreationTime -Descending | 
    Select-Object -First 1
                 
    if ($recentDir) {
        $targetDir = $recentDir.FullName
    }
    else {
        $ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $targetDir = Join-Path $reportsBase "$projectName`_$ts"
        New-Item -ItemType Directory -Force $targetDir | Out-Null
    }
    
    Move-Item -Path $file.FullName -Destination $targetDir -Force
    Write-Host "Moved $($file.Name) to $targetDir"
}

Remove-Item -Path $tempDir -Recurse -Force
Write-Host "GUI Smoke Reports processing done."
