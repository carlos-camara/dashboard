from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os
import glob

# Find the latest HTML report
report_dir = "reports/performance_run"
html_files = glob.glob(os.path.join(report_dir, "performance_*.html"))
if not html_files:
    print("No HTML reports found.")
    exit(1)

latest_report = max(html_files, key=os.path.getmtime)
print(f"Using latest report: {latest_report}")

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--window-size=1920,3000")

driver = webdriver.Chrome(options=chrome_options)
report_path = os.path.abspath(latest_report)
driver.get(f"file:///{report_path}")

time.sleep(10) # Heavy wait for ECharts

canvases = driver.find_elements(By.TAG_NAME, "canvas")
print(f"Found {len(canvases)} canvases")

targets = ["rps", "latency"]
for i, key in enumerate(targets):
    if i < len(canvases):
        try:
            # Go up 2 levels from canvas to get the title + chart box
            container = canvases[i].find_element(By.XPATH, "./../..")
            screenshot_path = f"reports/performance_run/perf_{key}_chart.png"
            container.screenshot(screenshot_path)
            print(f"Captured {key} to {screenshot_path}")
        except Exception as e:
            print(f"Error capturing {key}: {e}")

driver.quit()
