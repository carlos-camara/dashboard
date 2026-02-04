import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import base64
from datetime import datetime
from qa_framework.core.language_handler import LanguageHandler
from qa_framework.core.variable_handler import VariableHandler

from qa_framework.utils.hooks import FrameworkHooks

def before_all(context):
    """
    Project-level setup.
    """
    lang_dir = os.path.join(os.path.dirname(__file__), "language")
    FrameworkHooks.bootstrap(context, lang_dir=lang_dir)
    
    # Run-specific failure dir for HTML reporting
    context.failure_screenshots_dir = os.path.join("features", "resources", "screenshots")

    # PROJECT-SPECIFIC SEEDING: Ensure performance reports exist
    reports_perf_dir = os.path.join("reports", "performance_run")
    if not os.path.exists(reports_perf_dir):
        os.makedirs(reports_perf_dir)

    print("[SETUP] Seeding comprehensive performance report for GUI tests...")
    dummy_timestamp = context.run_timestamp
    dummy_dir_name = f"performance_{dummy_timestamp}"
    dummy_path = os.path.join(reports_perf_dir, dummy_dir_name)
    if not os.path.exists(dummy_path):
        os.makedirs(dummy_path)
    
    # Create dummy _stats.csv with ALL required endpoints for tests
    csv_path = os.path.join(dummy_path, "dummy_stats.csv")
    with open(csv_path, "w") as f:
        f.write('"Type","Name","Request Count","Failure Count","Median Response Time","Average Response Time","Min Response Time","Max Response Time","Average Content Size","Requests/s","Failures/s","50%","66%","75%","80%","90%","95%","98%","99%","100%"\n')
        f.write('"GET","/api/test",1000,0,50,55,10,200,500,50.0,0.0,50,60,70,80,90,100,120,150,200\n')
        f.write('"GET","/api/health",500,0,20,25,5,100,150,25.0,0.0,20,25,30,35,40,50,60,80,100\n')
        f.write('"GET","/api/runs",200,0,40,45,15,150,800,10.0,0.0,40,45,50,55,60,70,80,90,120\n')
        f.write('"GET","/api/endpoints",200,0,60,65,20,180,1200,10.0,0.0,60,65,70,75,80,90,100,110,140\n')

def before_scenario(context, scenario):
     pass

def after_step(context, step):
    """Capture screenshots on failure using framework utility."""
    FrameworkHooks.handle_step_failure(context, step, context.failure_screenshots_dir)

def after_all(context):
    """Project-level teardown using framework hook."""
    FrameworkHooks.teardown(context)
