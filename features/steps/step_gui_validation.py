from behave import given, then
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@given('I navigate to the dashboard at "{url}"')
def step_navigate_to_dashboard(context, url):
    """
    Navigates the Selenium driver to the specified URL.
    The driver is initialized in features/environment.py
    """
    context.driver.get(url)

@then('the page title should be "{expected_title}"')
def step_verify_page_title(context, expected_title):
    """
    Verifies that the current browser window's title matches the expected one.
    """
    # Wait up to 10 seconds for the title to be exactly what we expect
    WebDriverWait(context.driver, 10).until(
        EC.title_is(expected_title)
    )
    actual_title = context.driver.title
    assert actual_title == expected_title, f"Expected title '{expected_title}' but got '{actual_title}'"

@then('I should see at least {count:d} elements with selector "{locator_name}" in "{section}"')
def step_verify_element_count_section(context, count, locator_name, section):
    from features.steps.step_gui_interactions import get_dashboard_page
    page = get_dashboard_page(context)
    locator = page.get_locator(f"{section}.{locator_name}")
    elements = page.find_elements(locator)
    actual_count = len(elements)
    assert actual_count >= count, f"Expected at least {count} elements for {section}.{locator_name}, found {actual_count}"
