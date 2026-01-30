import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1920,5000")

driver = webdriver.Chrome(options=options)

def save_step(step_name):
    driver.save_screenshot(f"debug_step_{step_name}.png")
    print(f"Captured: debug_step_{step_name}.png")

try:
    print("Step 1: System Boot...")
    driver.get("http://localhost:3000")
    time.sleep(5)
    save_step("1_boot")
    
    print("Step 2: Force Endpoints Nav...")
    driver.execute_script("""
        const items = Array.from(document.querySelectorAll('button, span, div'));
        const target = items.find(i => i.innerText.trim() === 'Endpoints');
        if (target) {
            const btn = target.closest('button') || target;
            btn.click();
        }
    """)
    time.sleep(3)
    save_step("2_endpoints")
    
    print("Step 3: Force Card Expansion...")
    driver.execute_script("""
        const h3s = Array.from(document.querySelectorAll('h3'));
        const dash = h3s.find(h => h.innerText.includes('dashboard'));
        if (dash) {
            const card = dash.closest('div[class*="cursor-pointer"]');
            if (card) card.click();
        }
    """)
    time.sleep(4)
    save_step("3_expanded")
    
    print("Step 4: Force Endpoint Selection...")
    driver.execute_script("""
        const all = Array.from(document.querySelectorAll('span, div'));
        const target = all.find(e => e.innerText.trim() === '/api/runs');
        if (target) {
            const row = target.closest('div[class*="cursor-pointer"]');
            if (row) row.click();
        }
    """)
    time.sleep(5)
    save_step("4_detail")
    
    print("Step 5: Force Report Open...")
    driver.execute_script("""
        const btns = Array.from(document.querySelectorAll('button'));
        const report = btns.find(b => b.innerText.toUpperCase().includes('OPEN FULL REPORT'));
        if (report) {
            report.click();
            console.log("Clicked report button");
        } else {
            console.log("Report button not found");
        }
    """)
    time.sleep(8)
    save_step("5_report")
    
    print("Step 6: Synchronizing Visuals...")
    # Wait for the audit table or title
    WebDriverWait(driver, 25).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Deep Core Performance')]"))
    )
    time.sleep(12) 
    save_step("6_final")
    
    print("Step 7: Archiving Interactive Suite...")
    driver.save_screenshot("interactive_charts_digital_twin.png")
    
    driver.execute_script("window.scrollTo(0, 1000);")
    time.sleep(3)
    driver.save_screenshot("interactive_charts_throughput.png")
    
    driver.execute_script("window.scrollTo(0, 2000);")
    time.sleep(3)
    driver.save_screenshot("interactive_charts_latency.png")
    
    print("SUCCESS: Full suite archived.")

except Exception as e:
    print(f"FATAL: {str(e)}")
    driver.save_screenshot("debug_interactive_fail_stepped.png")

finally:
    driver.quit()
