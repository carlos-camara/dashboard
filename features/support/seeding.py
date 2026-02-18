import os
from datetime import datetime


def seed_test_run_data(context):
    """
    Ensures XML test run reports exist for the dashboard to display.
    """
    reports_run_dir = os.path.join("reports", "test_run")
    if not os.path.exists(reports_run_dir):
        os.makedirs(reports_run_dir)
    
    seed_run_dir = os.path.join(reports_run_dir, "seed_dashboard_run")
    if not os.path.exists(seed_run_dir):
        os.makedirs(seed_run_dir)
        
    xml_path = os.path.join(seed_run_dir, "results.xml")
    if not os.path.exists(xml_path):
        # Create a JUnit XML with one failure to test incident expansion
        timestamp = datetime.now().isoformat()
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="dashboard.gui" tests="6" failures="1" errors="0" skipped="0" time="12.5" timestamp="{timestamp}">
    <testcase classname="dashboard.gui.login" name="Successful Login" time="2.5"/>
    <testcase classname="dashboard.gui.navigation" name="Navigate to Settings" time="1.2"/>
    <testcase classname="dashboard.gui.project" name="View Project Details" time="3.0"/>
    <testcase classname="dashboard.gui.summary" name="Validate Dashboard Metrics" time="2.0">
      <failure message="Logic Verification Failed in dashboard">
        AssertionError: Data mismatch in stats grid
        at DashboardView.fetchData (DashboardView.tsx:58)
      </failure>
    </testcase>
    <testcase classname="dashboard.api.users" name="Get User List" time="0.5"/>
    <testcase classname="dashboard.api.auth" name="Login API" time="0.8"/>
  </testsuite>
</testsuites>
'''
        with open(xml_path, "w") as f:
            f.write(xml_content)
    
    print(f"[SETUP] Seeded XML report at {xml_path}")
