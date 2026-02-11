from behave import step
import time

@step('I wait for "{name}" to be stable')
@step('I wait for "{name}" to update')
def step_wait_for_stable(context, name):
    """
    Wait for a specific element or page section to stabilize.
    
    This is a professional wrapper around explicit waits or condition checking.
    Currently used to allow animations or data fetches to complete.
    
    Args:
        name: The name of the component (e.g., "dashboard", "chart")
    """
    # In a future iteration, this could check network idle state or
    # wait for specific loading spinners to disappear.
    # For now, 1 second is sufficient for local animations.
    time.sleep(1)


@step('the "{element_name}" element should contain text "{text}"')
def step_element_should_contain_text_custom(context, element_name, text):
    """
    Verify a page object element contains expected text.
    Alias for framework step to match specific feature file syntax.
    """
    # Import from framework to reuse logic
    from qa_framework.steps.gui_steps import step_element_should_contain_text
    # Call framework step (it handles page context lookup internally if needed, 
    # but here we need to ensure context.current_page is set or pass it explicitly if the step implies it)
    
    # The feature file usage implies context.current_page is set by "Given/Then the 'dashboard' page is displayed"
    # and this step just targets an element on that page.
    # The framework step signature is (context, element_name, page_name, text).
    # But wait, the framework has `step_current_element_should_contain_text(context, element_name, text)`.
    # We should reuse that.
    
    from qa_framework.steps.gui_steps import step_current_element_should_contain_text
    step_current_element_should_contain_text(context, element_name, text)


@step('I verify the content of the first {page_count:d} pages of "{filename}"')
def step_verify_pdf_content_generic(context, page_count, filename):
    """
    Verify that the downloaded PDF has content on the first N pages.
    Checks for non-empty text extraction.
    """
    import os
    from pypdf import PdfReader
    
    # Downloads dir is usually in user home/Downloads
    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    filepath = os.path.join(downloads_dir, filename)
    
    # Wait for file to exist (simple retry)
    for _ in range(5):
        if os.path.exists(filepath):
            break
        time.sleep(1)
        
    assert os.path.exists(filepath), f"File {filename} not found in {downloads_dir}"
    
    reader = PdfReader(filepath)
    actual_pages = len(reader.pages)
    assert actual_pages >= page_count, f"PDF has {actual_pages} pages, expected at least {page_count}"
    
    for i in range(page_count):
        page_text = reader.pages[i].extract_text()
        assert page_text.strip(), f"Page {i+1} of {filename} is empty or could not be read."


@step('the downloaded executive report for today should exist')
def step_verify_downloaded_executive_report(context):
    """
    Verify that the executive report for the current date exists.
    Filename format: SENTINEL_EXECUTIVE_REPORT_YYYY-MM-DD.pdf
    """
    from datetime import datetime
    import os
    
    from datetime import datetime, timedelta
    import os
    
    local_today = datetime.now().strftime("%Y-%m-%d")
    utc_today = datetime.utcnow().strftime("%Y-%m-%d")
    
    possible_filenames = [
        f"SENTINEL_EXECUTIVE_REPORT_{local_today}.pdf",
        f"SENTINEL_EXECUTIVE_REPORT_{utc_today}.pdf"
    ]
    
    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    filepath = None
    
    # Wait for any of the possible files (Wait up to 30 seconds)
    for _ in range(30):
        for filename in possible_filenames:
            temp_path = os.path.join(downloads_dir, filename)
            if os.path.exists(temp_path):
                filepath = temp_path
                context.last_downloaded_file = filename
                break
        if filepath:
            break
        time.sleep(1)
        
    assert filepath, f"Executive report (tried {possible_filenames}) not found in {downloads_dir}"
    
    # Store filename in context for subsequent steps if needed
    context.last_downloaded_file = filename


@step('I verify the content of the first {page_count:d} pages of the downloaded executive report')
def step_verify_content_of_downloaded_report(context, page_count):
    """
    Verify content of the report identified in previous step.
    """
    if not hasattr(context, 'last_downloaded_file'):
        raise AssertionError("No downloaded file listed in context. checking step must run first.")
    
    step_verify_pdf_content_generic(context, page_count, context.last_downloaded_file)



