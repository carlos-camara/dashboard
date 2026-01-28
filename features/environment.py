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

    options = Options()
    if headless:
        # Headless moderno (Chrome)
        options.add_argument("--headless=new")

    # Recomendado para contenedores/CI
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Extras útiles
    options.add_argument("--window-size=1365,768")
    options.add_argument("--disable-gpu")

    context.driver = webdriver.Chrome(options=options)
    context.driver.implicitly_wait(5)
    
    # Initialize screenshots list and run timestamp
    context.screenshots = []
    
    # Create a timestamped directory for this run's failures
    run_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    context.failure_screenshots_dir = os.path.join("features", "resources", "screenshots", run_timestamp)

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

