import subprocess
import sys
import os
from qa_framework.utils.report_manager import ReportManager

def run_suite(tags=None, junit_dir="temp_junit"):
    """Run behave and organize reports"""
    if not os.path.exists(junit_dir):
        os.makedirs(junit_dir)
        
    cmd = [sys.executable, "-m", "behave", "features", "--junit", "--junit-directory", junit_dir]
    if tags:
        for tag in tags.split(','):
            cmd.extend(["--tags", tag.strip()])
            
    # Always include --no-capture for CI/console visibility
    cmd.append("--no-capture")
    
    print(f"[RUNNER] Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    
    # Organize reports
    print("[RUNNER] Organizing reports...")
    ReportManager.organize_junit_reports(junit_dir, "reports/test_run")
    
    return result.returncode

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run QA Hub tests")
    parser.add_argument("--tags", help="Tags to run (comma separated)", default="smoke,gui")
    args = parser.parse_args()
    
    sys.exit(run_suite(tags=args.tags))
