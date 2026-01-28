from behave import given, when, then
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time
from datetime import datetime
from features.page_objects.dashboard_page import DashboardPage

# Screenshot directory
SCREENSHOTS_DIR = os.path.join("features", "resources", "screenshots")

def ensure_screenshots_dir():
    """Ensure screenshots directory exists"""
    if not os.path.exists(SCREENSHOTS_DIR):
        os.makedirs(SCREENSHOTS_DIR)

def get_dashboard_page(context):
    """Get or create DashboardPage instance"""
    if not hasattr(context, 'dashboard_page'):
        context.dashboard_page = DashboardPage(context.driver)
    return context.dashboard_page

@when('I wait for {seconds:d} seconds')
def step_wait_seconds(context, seconds):
    """
    Explicit wait for a specified number of seconds.
    Useful for animations or async operations.
    """
    time.sleep(seconds)

@when('I click on the element with text "{text}"')
def step_click_element_by_text(context, text):
    """
    Clicks on an element containing the specified text.
    Uses Page Object locator builder.
    """
    page = get_dashboard_page(context)
    locator = page.text_locator(text)
    page.click(locator)

@when('I click on the element with class "{class_name}"')
def step_click_element_by_class(context, class_name):
    """
    Clicks on an element with the specified CSS class.
    """
    page = get_dashboard_page(context)
    locator = (By.CLASS_NAME, class_name)
    page.click(locator)

@when('I click on the button with text "{button_text}"')
def step_click_button_by_text(context, button_text):
    """
    Clicks on a button element containing the specified text.
    Uses Page Object locator builder.
    """
    page = get_dashboard_page(context)
    locator = page.button_locator(button_text)
    page.click(locator)

@when('I click on the sync button')
def step_click_sync_button(context):
    page = DashboardPage(context.driver)
    page.click(page.SYNC_BUTTON)

@when('I apply the "7 Days" time filter')
def step_apply_7_days_filter(context):
    page = DashboardPage(context.driver)
    page.click(page.FILTER_7_DAYS)

@when('I apply the "30 Days" time filter')
def step_apply_30_days_filter(context):
    page = DashboardPage(context.driver)
    page.click(page.FILTER_30_DAYS)

@when('I apply the "All Time" time filter')
def step_apply_all_time_filter(context):
    page = DashboardPage(context.driver)
    page.click(page.FILTER_ALL_TIME)

@when('I export the report')
def step_export_report(context):
    page = DashboardPage(context.driver)
    page.click(page.EXPORT_BUTTON)

@when('I expand the "Recent Runs" section')
def step_expand_recent_runs(context):
    page = DashboardPage(context.driver)
    # Use the heading to toggle expansion if that's the behavior, or the section click
    # For now, clicking the heading seems safest or standard
    page.click(page.RECENT_RUNS_HEADING)

@when('I switch the chart view to "{mode}"')
def step_switch_chart_mode(context, mode):
    page = DashboardPage(context.driver)
    if mode.lower() == "volume":
        page.click(page.TIMELINE_TOGGLE_VOLUME)
    elif mode.lower() == "success": # or Activity
        page.click(page.TIMELINE_TOGGLE_SUCCESS)
    else:
        raise ValueError(f"Unknown chart mode: {mode}")


@then('I should see the text "{text}"')
def step_verify_text_present(context, text):
    """
    Verifies that the specified text is present on the page.
    Uses Page Object locator builder.
    """
    page = get_dashboard_page(context)
    locator = page.text_locator(text)
    assert page.is_visible(locator), f"Text '{text}' not found or not visible on page"

@then('I should see an element with class "{class_name}"')
def step_verify_element_by_class(context, class_name):
    """
    Verifies that an element with the specified class exists and is visible.
    """
    page = get_dashboard_page(context)
    locator = (By.CLASS_NAME, class_name)
    assert page.is_visible(locator), f"Element with class '{class_name}' is not visible"

@then('I should see at least {count:d} elements with class "{class_name}"')
def step_verify_multiple_elements(context, count, class_name):
    """
    Verifies that at least N elements with the specified class exist.
    Uses XPath for better compatibility with partial/complex class names.
    """
    page = get_dashboard_page(context)
    # Robust XPath for class matching
    locator = (By.XPATH, f"//*[contains(concat(' ', normalize-space(@class), ' '), ' {class_name} ')]")
    elements = page.find_elements(locator)
    actual_count = len(elements)
    assert actual_count >= count, f"Expected at least {count} elements with class '{class_name}', found {actual_count}"

@then('the system status should be valid')
def step_verify_system_status_valid(context):
    page = get_dashboard_page(context)
    locator = page.SYSTEM_STATUS
    element = page.find_element(locator)
    text = element.text
    valid_statuses = [
        "SYSTEM OPTIMAL", 
        "ALL SYSTEMS OPERATIONAL", 
        "PARTIAL SERVICE DEGRADATION", 
        "CRITICAL INSTABILITY DETECTED",
        "CONNECTION SEVERED - OFFLINE MODE"
    ]
    # Check if any valid status is in the text
    assert any(status in text for status in valid_statuses), f"Status '{text}' is not a valid system status"


@then('I take a screenshot named "{screenshot_name}"')
def step_take_screenshot(context, screenshot_name):
    """
    Takes a screenshot and saves it to features/resources/screenshots/.
    Filename format: {screenshot_name}.png (fixed name, overwrites previous)
    Also embeds the screenshot in the Behave report for visualization.
    """
    ensure_screenshots_dir()
    
    # Use fixed filename (no timestamp) to overwrite previous screenshots
    filename = f"{screenshot_name}.png"
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    
    # Take screenshot
    context.driver.save_screenshot(filepath)
    
    # Embed screenshot in Behave report
    try:
        if hasattr(context, 'embed'):
             # Read screenshot as base64 for embedding
            import base64
            with open(filepath, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
            context.embed('image/png', img_data, caption=screenshot_name)
        
        # Print with HTML formatting
        print(f"\n[SCREENSHOT] {screenshot_name}")
        print(f"   Location: {filepath}")
        print(f"   <img src='file:///{filepath}' width='800' alt='{screenshot_name}' />")
    except Exception as e:
        print(f"Screenshot saved but embedding failed: {e}")
    
    if not hasattr(context, 'screenshots'):
        context.screenshots = []
    context.screenshots.append(filepath)

@then('I take a screenshot of the "{element_name}" named "{screenshot_name}"')
def step_take_element_screenshot(context, element_name, screenshot_name):
    """
    Takes a screenshot of a specific element.
    """
    page = get_dashboard_page(context)
    ensure_screenshots_dir()
    
    # Map friendly names to locators property names or logic
    locator = None
    if "header" in element_name.lower():
        locator = (By.TAG_NAME, "header")
    elif "chart" in element_name.lower():
        locator = page.TIMELINE_CHART
    elif "stats" in element_name.lower():
        locator = (By.XPATH, "//*[contains(normalize-space(.), 'System Health')]/ancestor::div[contains(@class, 'grid')]")
    elif "sector" in element_name.lower() or "runs" in element_name.lower():
        locator = page.RECENT_RUNS_HEADING # Use heading as anchor or find section
        locator = (By.XPATH, "//div[contains(., 'Sector Integrity')]/ancestor::div[contains(@class, 'col-span')]")
    elif "incident" in element_name.lower():
        locator = (By.XPATH, "//div[contains(., 'Incident Taxonomy')]/ancestor::div[contains(@class, 'col-span')]")
    elif "list" in element_name.lower() or "panel" in element_name.lower():
        # Try to capture the row containing lists
        locator = (By.XPATH, "//div[contains(., 'Sector Integrity')]/ancestor::div[contains(@class, 'grid')]") 
    elif "footer" in element_name.lower() or "endpoints" in element_name.lower():
         locator = page.ENDPOINTS_CATALOG

    if locator:
        try:
            element = page.find_element(locator)
            filename = f"{screenshot_name}.png"
            filepath = os.path.join(SCREENSHOTS_DIR, filename)
            element.screenshot(filepath)
            
            # Embed
            if hasattr(context, 'embed'):
                 import base64
                 with open(filepath, 'rb') as img_file:
                    img_data = base64.b64encode(img_file.read()).decode('utf-8')
                 context.embed('image/png', img_data, caption=screenshot_name)
                 
            print(f"\n[SCREENSHOT] {screenshot_name}")
            print(f"   Location: {filepath}")
            print(f"   <img src='file:///{filepath}' width='800' alt='{screenshot_name}' />")
        except Exception as e:
            print(f"Failed to capture element screenshot: {e}. Fallback to full page.")
            step_take_screenshot(context, screenshot_name)
    else:
        step_take_screenshot(context, screenshot_name)

@then('I take a full page screenshot named "{screenshot_name}"')
def step_take_full_page_screenshot(context, screenshot_name):
    """
    Takes a full-page screenshot (if supported by the browser).
    For Chrome, this requires specific settings.
    Also embeds the screenshot in the Behave report.
    Filename format: {screenshot_name}_fullpage.png (fixed name, overwrites previous)
    """
    ensure_screenshots_dir()
    
    # Use fixed filename (no timestamp)
    filename = f"{screenshot_name}_fullpage.png"
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    
    # Get original window size
    original_size = context.driver.get_window_size()
    
    # Get scroll height
    scroll_height = context.driver.execute_script("return document.body.scrollHeight")
    
    # Set window size to full page
    context.driver.set_window_size(original_size['width'], scroll_height)
    
    # Take screenshot
    context.driver.save_screenshot(filepath)
    
    # Restore original size
    context.driver.set_window_size(original_size['width'], original_size['height'])
    
    # Embed screenshot in report
    try:
        import base64
        with open(filepath, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
            
        if hasattr(context, 'embed'):
            context.embed('image/png', img_data, caption=f"{screenshot_name} (Full Page)")
        
        print(f"\n[SCREENSHOT] Full page: {screenshot_name}")
        print(f"   Location: {filepath}")
        print(f"   <img src='file:///{filepath}' width='800' alt='{screenshot_name}' />")
    except Exception as e:
        print(f"Screenshot saved but embedding failed: {e}")
    
    if not hasattr(context, 'screenshots'):
        context.screenshots = []
    context.screenshots.append(filepath)

@then('the page URL should contain "{url_fragment}"')
def step_verify_url_contains(context, url_fragment):
    """
    Verifies that the current URL contains the specified fragment.
    """
    current_url = context.driver.current_url
    assert url_fragment in current_url, f"Expected URL to contain '{url_fragment}', but got '{current_url}'"

@then('I should see a heading with text "{heading_text}"')
def step_verify_heading(context, heading_text):
    """
    Verifies that a heading (h1-h6) with the specified text exists.
    Uses Page Object locator builder.
    """
    page = get_dashboard_page(context)
    locator = page.heading_locator(heading_text)
    assert page.is_visible(locator), f"Heading '{heading_text}' is not visible"

@when('I scroll to the bottom of the page')
def step_scroll_to_bottom(context):
    """
    Scrolls to the bottom of the page.
    """
    page = get_dashboard_page(context)
    page.scroll_to_bottom()
    time.sleep(0.5)  # Wait for scroll to complete

@when('I scroll to the top of the page')
def step_scroll_to_top(context):
    """
    Scrolls to the top of the page.
    """
    page = get_dashboard_page(context)
    page.scroll_to_top()
    time.sleep(0.5)

@when('I click on the "{locator_name}" in the sidebar')
def step_click_sidebar_element(context, locator_name):
    page = get_dashboard_page(context)
    locator = page.get_locator(f"sidebar.{locator_name}")
    page.click(locator)

@when('I click on the "{locator_name}" in "{section}"')
def step_click_section_element(context, locator_name, section):
    page = get_dashboard_page(context)
    locator = page.get_locator(f"{section}.{locator_name}")
    page.click(locator)

@when('I type "{text}" into the "{locator_name}" in "{section}"')
def step_type_section_element(context, text, locator_name, section):
    page = get_dashboard_page(context)
    locator = page.get_locator(f"{section}.{locator_name}")
    page.send_keys(locator, text)
