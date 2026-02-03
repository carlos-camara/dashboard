import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import base64
from datetime import datetime

def before_all(context):
    """
    Se ejecuta una vez antes de todos los escenarios.
    Configura Chrome en modo headless por defecto para CI (Jenkins).
    """
    headless = os.getenv("HEADLESS", "true").lower() == "true"
    
    # Use generic driver factory from framework
    from qa_framework.utils.driver import get_driver
    context.driver = get_driver(headless=headless)
    
    # Initialize screenshots list and run timestamp
    context.screenshots = []
    
    # Create a timestamped directory for this run's failures
    run_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    context.failure_screenshots_dir = os.path.join("features", "resources", "screenshots", run_timestamp)

    # SEEDING: Ensure performance reports exist for the UI to display the card
    # This fixes the CI issue where the report directory is empty or missing specific endpoints
    reports_perf_dir = os.path.join("reports", "performance_run")
    if not os.path.exists(reports_perf_dir):
        os.makedirs(reports_perf_dir)

    # Always create a new dummy report with fresh timestamp to ensure it's picked up as "latest"
    # This guarantees the test has the data it needs regardless of previous steps
    print("[SETUP] Seeding comprehensive performance report for GUI tests...")
    dummy_dir_name = f"performance_{run_timestamp}"
    dummy_path = os.path.join(reports_perf_dir, dummy_dir_name)
    if not os.path.exists(dummy_path):
        os.makedirs(dummy_path)
    
    # Create dummy _stats.csv with ALL required endpoints for tests
    csv_path = os.path.join(dummy_path, "dummy_stats.csv")
    with open(csv_path, "w") as f:
        # Minimal headers required by server.js
        f.write('"Type","Name","Request Count","Failure Count","Median Response Time","Average Response Time","Min Response Time","Max Response Time","Average Content Size","Requests/s","Failures/s","50%","66%","75%","80%","90%","95%","98%","99%","100%"\n')
        # /api/test - Generic
        f.write('"GET","/api/test",1000,0,50,55,10,200,500,50.0,0.0,50,60,70,80,90,100,120,150,200\n')
        # /api/health - Required for Deep Dive into Endpoint Detail
        f.write('"GET","/api/health",500,0,20,25,5,100,150,25.0,0.0,20,25,30,35,40,50,60,80,100\n')
        # /api/runs - Required for other views
        f.write('"GET","/api/runs",200,0,40,45,15,150,800,10.0,0.0,40,45,50,55,60,70,80,90,120\n')
        # /api/endpoints - Required for catalog view
        f.write('"GET","/api/endpoints",200,0,60,65,20,180,1200,10.0,0.0,60,65,70,75,80,90,100,110,140\n')

def before_scenario(context, scenario):
     pass

def after_step(context, step):
    """
    Se ejecuta después de cada step.
    Captura screenshot automáticamente si el step falla.
    """
    if step.status == "failed" and hasattr(context, 'driver'):
        # Ensure the run-specific directory exists
        if not os.path.exists(context.failure_screenshots_dir):
            os.makedirs(context.failure_screenshots_dir)
        
        # Generate filename for failure screenshot
        # We allow multiple failures in a run, so we keep the timestamp in the filename or just rely on the step name?
        # User asked for a folder with date/time. Inside we can just use Scenario_Step or similar.
        # Let's keep a mini-timestamp or incrementer if needed, but the folder is already timestamped.
        
        scenario_name = context.scenario.name.replace(" ", "_").replace("/", "_")
        step_name_clean = step.name.replace(" ", "_").replace("/", "_")[:30] # Limit length
        filename = f"FAILED_{scenario_name}_{step_name_clean}.png"
        filepath = os.path.join(context.failure_screenshots_dir, filename)
        
        try:
            # Take screenshot
            context.driver.save_screenshot(filepath)
            
            # Embed in report (requires absolute path or relative to report?)
            # Behave standard embedding usually takes bytes.
            # For our HTML log logic, we use file:///
            
            print(f"\n[FAILURE] Screenshot captured")
            print(f"   Scenario: {context.scenario.name}")
            print(f"   Failed Step: {step.name}")
            print(f"   Location: {filepath}")
            print(f"   <img src='file:///{os.path.abspath(filepath)}' width='800' alt='Failure Screenshot' />")
            
            # Store in context
            if not hasattr(context, 'screenshots'):
                context.screenshots = []
            context.screenshots.append(filepath)
        except Exception as e:
            print(f"Failed to capture failure screenshot: {e}")
            
            # Store in context
            if not hasattr(context, 'screenshots'):
                context.screenshots = []
            context.screenshots.append(filepath)
        except Exception as e:
            print(f"Failed to capture failure screenshot: {e}")

def after_all(context):
    """
    Se ejecuta una vez al final.
    """
    if hasattr(context, "driver") and context.driver:
        context.driver.quit()
    
    # Print summary of screenshots
    if hasattr(context, 'screenshots') and context.screenshots:
        print(f"\n[SCREENSHOTS] Total captured: {len(context.screenshots)}")
        print(f"   Location: features/resources/screenshots/")

