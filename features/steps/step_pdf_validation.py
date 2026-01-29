from behave import then, when
import os
import time
import glob
from pypdf import PdfReader

# Define default downloads directory (Adjust based on likely user config or project root)
# In this environment, we might need to check where the browser downloads files.
# Default Chrome/Edge usually goes to User/Downloads.
# However, selenium driver configuration might need to specify a download dir to be sure.
# For now, we'll try to find it in the standard Downloads folder or prompt the user if we can't control it.
# Ideally, we should configure the driver to download to a specific temp folder, but we are modifying steps, not the driver config fixture right now.
# Let's assume standard User\Downloads for Windows.

DOWNLOADS_DIR = os.path.join(os.path.expanduser("~"), "Downloads")

@when('I wait for {seconds:d} seconds for the download to complete')
def step_wait_for_download(context, seconds):
    time.sleep(seconds)

@then('the downloaded file "{filename}" should exist')
def step_verify_file_exists(context, filename):
    filepath = os.path.join(DOWNLOADS_DIR, filename)
    
    # Check if file exists, maybe retry a few times
    retries = 3
    found = False
    for _ in range(retries):
        if os.path.exists(filepath):
            found = True
            break
        time.sleep(1)
            
    assert found, f"File {filename} not found in {DOWNLOADS_DIR}"
    
    # Check size > 0
    assert os.path.getsize(filepath) > 0, f"File {filename} is empty"
    
    # Store path for next steps
    context.last_downloaded_file = filepath

@then('the PDF "{filename}" should have at least {page_count:d} pages')
def step_verify_pdf_pages(context, filename, page_count):
    filepath = context.last_downloaded_file
    reader = PdfReader(filepath)
    actual_pages = len(reader.pages)
    
    assert actual_pages >= page_count, f"Expected at least {page_count} pages, but found {actual_pages}"
    print(f"\n[PDF CHECK] File {filename} has {actual_pages} pages.")

@then('I verify the content of the first {count:d} pages of "{filename}"')
def step_verify_pdf_content(context, count, filename):
    filepath = context.last_downloaded_file
    reader = PdfReader(filepath)
    
    print(f"\n[PDF CONTENT VERIFICATION] Inspecting first {count} pages of {filename}...")
    
    for i in range(min(count, len(reader.pages))):
        page = reader.pages[i]
        text = page.extract_text()
        # Create a text-based representation (since we can't easily create images without poppler)
        # We'll save this as a 'screenshot' artifact in text form or print it to console
        print(f"\n--- PAGE {i+1} START ---")
        print(text[:500] + "..." if len(text) > 500 else text) # Print first 500 chars
        print(f"--- PAGE {i+1} END ---")
        
        # Normalize text for checking
        text_lower = text.lower()
        
        # Define keywords (ensure these match the reportGenerator.ts output)
        keywords = ["qa hub", "execution", "dashboard", "sentinel", "dossier", "executive"]
        
        found_any = any(k in text_lower for k in keywords)
        
        assert found_any, f"Page {i+1} content validation failed. Extracted text sample: {text[:100]}..."
    
    print("\n[SUCCESS] PDF content validation passed.")
