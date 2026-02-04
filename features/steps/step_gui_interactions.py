from behave import given, when, then, step
import os
import time

# Import ALL generic steps from framework
from qa_framework.steps.common_steps import *
from qa_framework.steps.gui_steps import *
from qa_framework.steps.api_steps import *
from qa_framework.steps.pdf_steps import *
from qa_framework.steps.gui_steps import resolve_i18n

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
        "[LANG:dashboard.filters.seven_days]": "filter_7_days",
        "[LANG:dashboard.filters.thirty_days]": "filter_30_days",
        "[LANG:dashboard.filters.all_time]": "filter_all_time",
        # Backward compatibility
        "7 Days": "filter_7_days",
        "30 Days": "filter_30_days"
    }
    
    if filter_name not in filter_mapping:
        # Check case-insensitive mapping if not found
        filter_name_lower = filter_name.lower()
        mapping_found = False
        for k, v in filter_mapping.items():
            if k.lower() == filter_name_lower:
                element_name = v
                mapping_found = True
                break
        
        if not mapping_found:
            raise ValueError(f"Unknown filter: {filter_name}")
    else:
        element_name = filter_mapping[filter_name]
    
    # Use flattened locator name
    element_name = f"actions_{element_name}"
    step_click_page_object(context, element_name, "dashboard")


@when('I switch the chart view to "{mode}"')
def step_switch_chart_mode(context, mode):
    """Switch chart visualization mode"""
    # Mapping based on i18n keys or lowercase literals
    mode_mapping = {
        "[LANG:dashboard.timeline.volume]": "toggle_volume",
        "[LANG:dashboard.timeline.success]": "toggle_success",
        "volume": "toggle_volume",
        "success": "toggle_success",
        "activity": "toggle_success"
    }
    
    mode_key = mode.lower()
    mapping_found = False
    for k, v in mode_mapping.items():
        if k.lower() == mode_key:
            element_name = v
            mapping_found = True
            break
            
    if not mapping_found:
        raise ValueError(f"Unknown chart mode: {mode}")
    
    # Use framework's generic step to click the toggle
    element_name = f"timeline_{element_name}"
    step_click_page_object(context, element_name, "dashboard")


@then('the system status should be valid')
def step_verify_system_status_valid(context):
    """Verify system status ticker shows valid status"""
    # Get the status text using framework element
    from qa_framework.steps.gui_steps import get_element_from_page_object
    
    element = get_element_from_page_object(context, "status_ticker_system_status", "dashboard")
    text = element.get_text()
    
    valid_statuses = [
        "SYSTEM OPTIMAL", "ALL SYSTEMS OPERATIONAL", 
        "PARTIAL SERVICE DEGRADATION", "MINOR ANOMALIES DETECTED",
        "CRITICAL INSTABILITY DETECTED", "CONNECTION SEVERED"
    ]
    
    assert any(status in text for status in valid_statuses), \
        f"Invalid system status: '{text}'. Expected one of {valid_statuses}"


@when('I export the report')
def step_export_report(context):
    """Click the export button in dashboard actions"""
    step_click_page_object(context, "actions_export_button", "dashboard")


@then('I take a screenshot of the "{element_description}" named "{screenshot_name}"')
def step_take_element_screenshot(context, element_description, screenshot_name):
    """Take a screenshot - for now just take a full page screenshot"""
    # This is a simplified version - could be enhanced to screenshot specific elements
    ensure_screenshots_dir()
    step_take_screenshot(context, screenshot_name)
