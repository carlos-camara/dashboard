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

driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:3000")
    time.sleep(5)
    endpoints_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Endpoints')]"))
    )
    driver.execute_script("arguments[0].click();", endpoints_btn)
    time.sleep(2)
    
    search_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'Search')]"))
    )
    search_input.clear()
    search_input.send_keys("dashboard")
    time.sleep(3)
    
    project_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h3[text()='dashboard']/ancestor::div[contains(@class, 'cursor-pointer')]"))
    )
    driver.execute_script("arguments[0].click();", project_card)
    time.sleep(5)
    
    with open("debug_spec_dom.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    print("DOM Dumped to debug_spec_dom.html")

finally:
    driver.quit()
