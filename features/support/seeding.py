import os
from datetime import datetime

def seed_performance_data(context):
    """
    Ensures performance reports exist for the dashboard to display.
    Creates a dummy performance run with seed data.
    """
    reports_perf_dir = os.path.join("reports", "performance_run")
    if not os.path.exists(reports_perf_dir):
        os.makedirs(reports_perf_dir)

    print("[SETUP] Seeding comprehensive performance report for GUI tests...")
    
    # Use context timestamp if available, else current time
    timestamp = getattr(context, 'run_timestamp', datetime.now().strftime("%Y-%m-%d_%H-%M-%S"))
    dummy_dir_name = f"performance_{timestamp}"
    dummy_path = os.path.join(reports_perf_dir, dummy_dir_name)
    
    if not os.path.exists(dummy_path):
        os.makedirs(dummy_path)
    
    # Create dummy _stats.csv with ALL required endpoints for tests
    csv_path = os.path.join(dummy_path, "seed_stats.csv")
    with open(csv_path, "w") as f:
        f.write('"Type","Name","Request Count","Failure Count","Median Response Time","Average Response Time","Min Response Time","Max Response Time","Average Content Size","Requests/s","Failures/s","50%","66%","75%","80%","90%","95%","98%","99%","100%"\n')
        f.write('"GET","/api/test",1000,0,50,55,10,200,500,50.0,0.0,50,60,70,80,90,100,120,150,200\n')
        f.write('"GET","/api/health",500,0,20,25,5,100,150,25.0,0.0,20,25,30,35,40,50,60,80,100\n')
        f.write('"GET","/api/runs",200,0,40,45,15,150,800,10.0,0.0,40,45,50,55,60,70,80,90,120\n')
        f.write('"GET","/api/endpoints",200,0,60,65,20,180,1200,10.0,0.0,60,65,70,75,80,90,100,110,140\n')

    # Also need _stats_history.csv for the server to consider it valid
    history_path = os.path.join(dummy_path, "seed_stats_history.csv")
    with open(history_path, "w") as f:
        f.write('"Timestamp","User Count","Type","Name","Requests/s","Failures/s","50%","66%","75%","80%","90%","95%","98%","99%","100%","Total Request Count","Total Failure Count","Total Median Response Time","Total Average Response Time","Total Min Response Time","Total Max Response Time"\n')
        now_ts = int(datetime.now().timestamp())
        for i in range(10):
            ts = now_ts - (i * 10)
            f.write(f'{ts},10,"GET","Total",50.0,0.0,50,60,70,80,90,100,110,120,130,1000,0,50,55,10,200\n')


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
    <testcase classname="dashboard.gui.incidents" name="Verify Incident Expansion" time="2.0">
      <failure message="Logic Verification Failed in dashboard">
        AssertionError: User context missing during verification
        at IncidentView.verifyTransaction (IncidentView.tsx:75)
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
    
    # Trigger Backend Sync
    try:
        import urllib.request
        req = urllib.request.Request("http://localhost:3001/api/sync", method="POST")
        with urllib.request.urlopen(req) as response:
            print(f"[SETUP] Backend Sync Triggered: {response.status}")
    except Exception as e:
        print(f"[SETUP] Backend Sync Failed: {e}")
