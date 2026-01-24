import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

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

def after_all(context):
    """
    Se ejecuta una vez al final.
    """
    if hasattr(context, "driver") and context.driver:
        context.driver.quit()