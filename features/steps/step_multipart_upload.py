from behave import when
import requests
import os
from http_helpers import full_url

@when('I upload the file "{filename}" to "{endpoint}"')
def step_upload_file(context, filename, endpoint):
    """
    Uploads a file to the specified endpoint using multipart/form-data.
    Assumes the file is located in 'features/resources' or 'features/data' or relative to current dir.
    """
    # Try to locate the file
    possible_paths = [
        filename,
        os.path.join("features", "resources", filename),
        os.path.join("features", "data", filename),
        os.path.join("test_data", filename)
    ]
    
    file_path = None
    for p in possible_paths:
        if os.path.exists(p):
            file_path = p
            break
            
    if not file_path:
        # Create a dummy file if it doesn't exist for testing purposes (e.g. valid-report.xml)
        if "xml" in filename:
             file_path = filename
             with open(file_path, "w") as f:
                 f.write("<testsuite><testcase name='Dummy Test' time='0.1'/></testsuite>")
        else:
            raise FileNotFoundError(f"File '{filename}' not found in {possible_paths}")

    url = full_url(context.base_url, endpoint)
    
    # Prepare the file for upload
    # 'files' matches the server side expectation: upload.array('files')
    files = {
        'files': (os.path.basename(file_path), open(file_path, 'rb'), 'application/xml')
    }
    
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}

    # Requests automatically sets the Content-Type to multipart/form-data with boundary
    # So we should NOT set Content-Type in headers if it's there
    headers = context.default_headers.copy()
    if 'Content-Type' in headers:
        del headers['Content-Type']

    context.last_request = {
        "method": "POST",
        "url": url,
        "files": [filename]
    }

    try:
        resp = requests.post(url, files=files, headers=headers, timeout=30)
        context.response = resp
        try:
            context.response_json = resp.json()
        except:
            context.response_json = None
    finally:
        files['files'][1].close()
        # Clean up dummy file if we made one
        if file_path == filename and "xml" in filename and not os.path.exists(os.path.join("features", "resources", filename)):
             try:
                 os.remove(file_path)
             except:
                 pass
