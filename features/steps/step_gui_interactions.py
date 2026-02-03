from behave import given, when, then, step
import os
import time

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

# -----------------------------------------------------------------------------
# PROJECT-SPECIFIC STEPS
# These steps contain business logic specific to this dashboard project
# -----------------------------------------------------------------------------

@when('I apply the "{filter_name}" time filter')
def step_apply_time_filter(context, filter_name):
    """Apply time filter using dashboard actions"""
    filter_mapping = {
        "7 Days": "filter_7_days",
        "30 Days": "filter_30_days",
        "All Time": "filter_all_time"
    }
    
    if filter_name not in filter_mapping:
        raise ValueError(f"Unknown filter: {filter_name}")
    
    # Use framework's generic step to click the filter button
    element_name = filter_mapping[filter_name]
    step_click_page_object(context, element_name, "dashboard.actions")


@when('I switch the chart view to "{mode}"')
def step_switch_chart_mode(context, mode):
    """Switch chart visualization mode"""
    mode_mapping = {
        "volume": "toggle_volume",
        "success": "toggle_success",
        "activity": "toggle_success"
    }
    
    mode_key = mode.lower()
    if mode_key not in mode_mapping:
        raise ValueError(f"Unknown chart mode: {mode}")
    
    # Use framework's generic step to click the toggle
    element_name = mode_mapping[mode_key]
    step_click_page_object(context, element_name, "dashboard.timeline")


@then('the system status should be valid')
def step_verify_system_status_valid(context):
    """Verify system status ticker shows valid status"""
    # Get the status text using framework element
    from qa_framework.steps.gui_steps import get_element_from_page_object
    
    element = get_element_from_page_object(context, "system_status", "dashboard.status_ticker")
    text = element.get_text()
    
    valid_statuses = [
        "SYSTEM OPTIMAL", "ALL SYSTEMS OPERATIONAL", 
        "PARTIAL SERVICE DEGRADATION", "MINOR ANOMALIES DETECTED",
        "CRITICAL INSTABILITY DETECTED", "CONNECTION SEVERED"
    ]
    
    assert any(status in text for status in valid_statuses), \
        f"Invalid system status: '{text}'. Expected one of {valid_statuses}"
