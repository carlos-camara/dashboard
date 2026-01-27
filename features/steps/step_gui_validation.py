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
