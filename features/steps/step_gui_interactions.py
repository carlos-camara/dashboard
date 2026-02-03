from behave import given, when, then, step
from selenium.webdriver.common.by import By
import os
import time
from features.page_objects.dashboard_page import DashboardPage

# Import ALL generic steps from framework to make them available to Behave
from qa_framework.steps.common_steps import *
from qa_framework.steps.gui_steps import *
from qa_framework.steps.api_steps import *
from qa_framework.steps.pdf_steps import *

# Project-specific Screenshot directory
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

# -----------------------------------------------------------------------------
# PROJECT-SPECIFIC STEPS
# -----------------------------------------------------------------------------

@when('I click on the sync button')
def step_click_sync_button(context):
    page = get_dashboard_page(context)
    page.click(page.SYNC_BUTTON)

@when('I apply the "{filter_name}" time filter')
def step_apply_time_filter(context, filter_name):
    page = get_dashboard_page(context)
    filters = {
        "7 Days": page.FILTER_7_DAYS,
        "30 Days": page.FILTER_30_DAYS,
        "All Time": page.FILTER_ALL_TIME
    }
    if filter_name in filters:
        page.click(filters[filter_name])
    else:
        raise ValueError(f"Unknown filter: {filter_name}")

@when('I export the report')
def step_export_report(context):
    page = get_dashboard_page(context)
    page.click(page.EXPORT_BUTTON)

@when('I expand the "Recent Runs" section')
def step_expand_recent_runs(context):
    page = get_dashboard_page(context)
    page.click(page.RECENT_RUNS_HEADING)

@when('I switch the chart view to "{mode}"')
def step_switch_chart_mode(context, mode):
    page = get_dashboard_page(context)
    if mode.lower() == "volume":
        page.click(page.TIMELINE_TOGGLE_VOLUME)
    elif mode.lower() in ["success", "activity"]:
        page.click(page.TIMELINE_TOGGLE_SUCCESS)
    else:
        raise ValueError(f"Unknown chart mode: {mode}")

@then('the system status should be valid')
def step_verify_system_status_valid(context):
    page = get_dashboard_page(context)
    text = page.get_text(page.SYSTEM_STATUS)
    valid_statuses = [
        "SYSTEM OPTIMAL", "ALL SYSTEMS OPERATIONAL", 
        "PARTIAL SERVICE DEGRADATION", "MINOR ANOMALIES DETECTED",
        "CRITICAL INSTABILITY DETECTED", "CONNECTION SEVERED"
    ]
    assert any(status in text for status in valid_statuses), f"Invalid status: {text}"

@then('I take a screenshot of the "{element_name}" named "{screenshot_name}"')
def step_take_element_screenshot(context, element_name, screenshot_name):
    page = get_dashboard_page(context)
    ensure_screenshots_dir()
    
    # Map friendly names to page object locators
    mapping = {
        "header": (By.TAG_NAME, "header"),
        "chart": page.TIMELINE_CHART,
        "endpoints": page.ENDPOINTS_CATALOG
    }
    
    locator = mapping.get(element_name.lower())
    if locator:
        filepath = os.path.join(SCREENSHOTS_DIR, f"{screenshot_name}.png")
        page.find_element(locator).screenshot(filepath)
    else:
        # Fallback to framework generic screenshot
        step_take_screenshot(context, screenshot_name)

@when('I click on the "{locator_name}" in the sidebar')
def step_click_sidebar_element(context, locator_name):
    page = get_dashboard_page(context)
    locator = page.get_locator(f"sidebar.{locator_name}")
    page.click(locator)

@step('I should see at least {count:d} elements with selector "{locator_name}" in "{section}"')
def step_verify_element_count_section(context, count, locator_name, section):
    page = get_dashboard_page(context)
    locator = page.get_locator(f"{section}.{locator_name}")
    elements = page.find_elements(locator)
    assert len(elements) >= count, f"Expected {count}, found {len(elements)}"
