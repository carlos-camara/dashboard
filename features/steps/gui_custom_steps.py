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



