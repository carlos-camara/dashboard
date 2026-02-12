from behave import step
import time

@step('the "{element_name}" element should contain text "{text}"')
def step_element_should_contain_text_custom(context, element_name, text):
    """
    Verify a page object element contains expected text.
    Alias for framework step to match specific feature file syntax.
    """
    from qa_framework.steps.gui_steps import step_current_element_should_contain_text
    step_current_element_should_contain_text(context, element_name, text)


@step('the downloaded executive report for today should exist')
def step_verify_downloaded_executive_report(context):
    """
    Verify that the executive report for the current date exists.
    Filename format: SENTINEL_EXECUTIVE_REPORT_YYYY-MM-DD.pdf
    """
    from datetime import datetime, timedelta
    import os
    import time
    
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
    
    # Reuse new framework generic step
    from qa_framework.steps.pdf_steps import step_verify_pdf_content_non_empty
    step_verify_pdf_content_non_empty(context, page_count, context.last_downloaded_file)



