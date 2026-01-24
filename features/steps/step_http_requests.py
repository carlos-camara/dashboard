from behave import given, when
import requests
from http_helpers import (
    full_url,
    loads_json_or_fail,
    table_to_params,
    table_to_form_including_headings,
)

# -----------------------------------------------------------------------------
# REQUEST STEPS
#
# These steps are responsible for:
#  - building the final URL (base_url + path)
#  - preparing request data (headers, query params, JSON body, form body)
#  - sending the HTTP request via requests
#  - storing results in Behave context so assertion steps can validate them
#
# Context fields used across the framework:
#  - context.base_url        : base API URL, e.g. https://httpbin.org
#  - context.default_headers : dict of headers that apply to subsequent requests
#  - context.response        : requests.Response from the last request
#  - context.response_json   : parsed JSON response (dict/list) or None if not JSON
#  - context.last_request    : debugging info (method/url/params/body/etc.)
# -----------------------------------------------------------------------------


@given('the API base URL is "{base_url}"')
def step_set_base_url(context, base_url: str):
    """
    Sets the base URL for the API under test.

    Why this exists:
    - Keeps feature files readable: scenarios can use paths like "/get" instead of full URLs.
    - Allows running the same tests against different environments by changing base_url.

    Also resets per-scenario request/response artifacts.
    """
    context.base_url = base_url
    context.response = None
    context.response_json = None
    context.last_request = None


@when('I send a "{method}" request to "{path}"')
def step_send_request_simple(context, method: str, path: str):
    """
    Sends an HTTP request without query params or body.

    Typical usage:
      When I send a "GET" request to "/get"
      When I send a "OPTIONS" request to "/anything"

    Notes:
    - Uses context.default_headers if already set by a previous "I set request headers" step.
    - Stores last_request for debugging when assertions fail.
    - Tries to parse response as JSON; if parsing fails, response_json remains None.
    """
    url = full_url(context.base_url, path)
    method_u = method.upper()

    # Store request metadata for later debugging (assertion error messages, reports, etc.)
    context.last_request = {"method": method_u, "url": url, "params": None, "json": None}

    # Ensure headers dictionary exists (prevents AttributeError in scenarios without "set headers")
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}

    # Perform HTTP call
    resp = requests.request(method=method_u, url=url, headers=context.default_headers, timeout=20)

    # Store raw response in context for assertion steps
    context.response = resp

    # Parse JSON if possible. If endpoint returns no JSON, keep response_json as None.
    try:
        context.response_json = resp.json()
    except Exception:
        context.response_json = None


@when('I send a "{method}" request to "{path}" with query parameters')
def step_send_request_with_query(context, method: str, path: str):
    """
    Sends an HTTP request with query parameters from a Behave table.

    Feature example:
      When I send a "GET" request to "/get" with query parameters
        | foo | bar |
        | n   | 1   |

    Implementation detail:
    - table_to_params converts the table into a dict. (Depending on your helper,
      it can also handle the "first row becomes headings" behaviour.)
    - Stores params in last_request for traceability.
    """
    url = full_url(context.base_url, path)
    method_u = method.upper()

    # Convert Behave table into query parameters (dict)
    params = table_to_params(context.table)

    context.last_request = {"method": method_u, "url": url, "params": params, "json": None}

    # Ensure headers dictionary exists (prevents AttributeError in scenarios without "set headers")
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}

    # NOTE: If you also want default headers here, add headers=context.default_headers
    resp = requests.request(method=method_u, url=url, headers=context.default_headers, params=params, timeout=20)

    context.response = resp
    try:
        context.response_json = resp.json()
    except Exception:
        context.response_json = None


@when('I send a "{method}" request to "{path}" with JSON body')
def step_send_request_with_json_body(context, method: str, path: str):
    """
    Sends an HTTP request with a JSON body provided as a docstring.

    Feature example:
      When I send a "POST" request to "/post" with JSON body
        \"\"\"
        { "id": 123 }
        \"\"\"

    Notes:
    - loads_json_or_fail parses the docstring strictly as JSON
      (requires double quotes for property names).
    - Uses requests' json= parameter so Content-Type is correctly set to application/json.
    """
    url = full_url(context.base_url, path)
    method_u = method.upper()

    # Parse JSON docstring into a Python object (dict/list/primitive)
    body = loads_json_or_fail(context.text)

    context.last_request = {"method": method_u, "url": url, "params": None, "json": body}

    # Ensure headers dictionary exists (prevents AttributeError in scenarios without "set headers")
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}
        
    # NOTE: If you also want default headers here, add headers=context.default_headers
    resp = requests.request(method=method_u, url=url, headers=context.default_headers, json=body, timeout=20)

    context.response = resp
    try:
        context.response_json = resp.json()
    except Exception:
        context.response_json = None


@when("I set request headers")
def step_set_request_headers(context):
    """
    Stores request headers to be used for subsequent requests.

    Feature example:
      When I set request headers:
        | Header       | Value        |
        | X-QA-Trace   | behave-suite  |
        | X-Client-App | qa-dashboard  |

    Why this exists:
    - Keeps scenarios readable (separates setup from the "send request" step).
    - Allows header reuse across multiple requests in the same scenario.

    Important:
    - Behave tables treat the first row as headings if no explicit headings are provided.
      Your helper table_to_params should handle that correctly, or you should provide
      a header row in the feature file.
    """
    if context.table is None:
        raise AssertionError(
            "This step requires a table, e.g.\n"
            "When I set request headers:\n"
            "  | X-QA-Trace   | behave-suite |\n"
            "  | X-Client-App | qa-dashboard |"
        )

    # Ensure headers dict exists
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}

    # Convert table rows into a dict (header -> value)
    new_headers = table_to_params(context.table)

    # Merge into existing defaults (later calls will include these headers)
    context.default_headers.update(new_headers)


@when('I send a "POST" request to "{path}" with form data')
def step_post_with_form_data(context, path: str):
    """
    Sends a POST request with application/x-www-form-urlencoded form data.

    Feature example:
      When I send a "POST" request to "/post" with form data:
        | Field    | Value |
        | username | john  |
        | plan     | pro   |

    Notes:
    - Uses requests' data= argument (form-encoded), NOT JSON.
    - On httpbin, this means the response will typically show:
        "form": {...}
        "json": null
      so you should assert form.* fields instead of json.*.
    - table_to_form_including_headings is designed to handle Behave's
      headings behaviour so you don't lose the first row.
    """
    if not hasattr(context, "default_headers") or context.default_headers is None:
        context.default_headers = {}

    url = full_url(context.base_url, path)

    # Parse table rows into a dict of form fields
    form = table_to_form_including_headings(context.table)

    resp = requests.post(url, data=form, headers=context.default_headers, timeout=20)

    context.response = resp
    try:
        context.response_json = resp.json()
    except Exception:
        context.response_json = None

    # Store request metadata for debugging/reporting
    context.last_request = {
        "method": "POST",
        "url": url,
        "headers": dict(context.default_headers),
        "form": form,
    }