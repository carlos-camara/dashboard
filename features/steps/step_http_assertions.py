"""
Behave step definitions (ASSERTIONS)

This file contains reusable *assertion steps* for API tests.
They are designed to validate:
- HTTP status codes
- JSON payload structure/content (via dot-notation paths)
- Response times
- Empty responses (body and/or content)
- Type checks for specific JSON fields

Assumptions:
- A request step has already stored:
  - context.response        -> requests.Response
  - context.response_json   -> parsed JSON (dict/list) or None
  - context.last_request    -> dict with method/url/headers/etc. for troubleshooting
"""

import re
from behave import then
from http_helpers import get_json_path, loads_json_or_fail, parse_expected, get_header_case_insensitive


@then("the response status code should be {status_code:d}")
def step_assert_status(context, status_code: int):
    """
    Validates the HTTP status code returned by the last request.

    Why it matters:
    - Status code is the first and most important contract signal in API testing.
    - If this fails, downstream JSON assertions are often meaningless.

    Debugging:
    - Includes last_request and first 500 chars of response body to speed up triage.
    """
    assert context.response is not None, "No response found. Did you send a request?"
    actual = context.response.status_code
    assert actual == status_code, (
        f"Expected status code {status_code}, got {actual}\n"
        f"Request: {context.last_request}\n"
        f"Response text: {context.response.text[:500]}"
    )


@then('the response JSON path "{path}" should be "{expected}"')
def step_assert_json_path_str(context, path: str, expected: str):
    """
    Validates that a JSON field (resolved via dot-notation path) equals an expected value.

    - path: dot-notation path, e.g. "json.id" or "headers.Host"
    - expected: string captured from feature file (may represent JSON literals)

    Notes:
    - Uses parse_expected() to convert feature strings into real types when possible:
      "1" -> 1, "true" -> True, "{}" -> dict, etc.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    actual = get_json_path(context.response_json, path)
    exp = parse_expected(expected)
    assert actual == exp, (
        f"JSON mismatch at '{path}'\n"
        f"Expected: {exp} ({type(exp)})\n"
        f"Actual:   {actual} ({type(actual)})\n"
        f"Request:  {context.last_request}"
    )


@then('the response JSON path "{path}" should be {expected:d}')
def step_assert_json_path_int(context, path: str, expected: int):
    """
    Integer-specific overload of the JSON path equality check.
    Behave's {expected:d} enforces the placeholder to be an integer.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    actual = get_json_path(context.response_json, path)
    assert actual == expected, (
        f"JSON mismatch at '{path}'\nExpected: {expected}\nActual: {actual}\nRequest: {context.last_request}"
    )


@then('the response JSON path "{path}" should be a "{py_type}"')
def step_assert_json_type(context, path: str, py_type: str):
    """
    Validates the Python type of a JSON field.

    Example:
      Then the response JSON path "args" should be a "dict"

    Supported types:
      str, int, float, bool, dict, list

    Why it matters:
    - Contract testing often cares about types, not just values.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    val = get_json_path(context.response_json, path)
    mapping = {
        "str": str,
        "int": int,
        "float": float,
        "bool": bool,
        "dict": dict,
        "list": list,
    }
    if py_type not in mapping:
        raise AssertionError(f"Unsupported type '{py_type}'. Supported types: {list(mapping.keys())}")
    assert isinstance(val, mapping[py_type]), f"Expected '{path}' to be a {py_type}, got {type(val)} -> {val}"


@then('the response JSON path "{path}" should be true')
def step_assert_json_path_true(context, path: str):
    """
    Validates that a JSON field is strictly boolean True (not truthy values like 1 or "true").
    Useful for contract correctness.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    actual = get_json_path(context.response_json, path)
    assert actual is True, (
        f"JSON mismatch at '{path}'\nExpected: true\nActual: {actual}\nRequest: {context.last_request}"
    )


@then('the response JSON path "{path}" should contain "{substring}"')
def step_assert_json_path_contains(context, path: str, substring: str):
    """
    Validates that a string field contains a given substring.

    Example:
      And the response JSON path "url" should contain "https://httpbin.org/get"

    Guards:
    - Fails fast if the resolved value isn't a string.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    actual = get_json_path(context.response_json, path)
    if not isinstance(actual, str):
        raise AssertionError(f"Expected a string at '{path}' to check containment, got: {type(actual)} -> {actual}")
    assert substring in actual, (
        f"Expected '{path}' to contain '{substring}'\nActual: {actual}\nRequest: {context.last_request}"
    )


@then("the response time should be less than {ms:d} ms")
@then("the response time should be less than {ms:d} milliseconds")
def step_assert_time(context, ms: int):
    """
    Performance guardrail.
    Validates the elapsed time of the last request (measured by requests.Response.elapsed).

    Notes:
    - This is a lightweight check for regressions, not a full load/perf test.
    - Thresholds should be generous in CI to avoid flaky failures due to network jitter.
    """
    assert context.response is not None, "No response found. Did you send a request?"
    elapsed_ms = context.response.elapsed.total_seconds() * 1000.0
    assert elapsed_ms < ms, (
        f"Response time too high: {elapsed_ms:.2f} ms (limit: {ms} ms)\n"
        f"Request: {context.last_request}"
    )


@then("the response JSON should contain keys")
def step_assert_json_keys(context):
    """
    Validates that the response JSON object contains a set of top-level keys.

    Usage (table):
      Then the response JSON should contain keys
        | args |
        | url  |

    Assumes:
    - context.response_json is a dict.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    expected_keys = [row[0].strip() for row in context.table]
    missing = [k for k in expected_keys if k not in context.response_json]
    assert not missing, f"Missing keys: {missing}. JSON keys: {list(context.response_json.keys())}"


@then('the response JSON path "{path}" should equal JSON')
def step_assert_json_equals_literal(context, path: str):
    """
    Validates that a JSON field equals an expected JSON literal provided as a docstring.

    Example:
      And the response JSON path "args" should equal JSON
        '''
        {}
        '''

    Why this step exists:
    - It avoids fragile string comparisons and ensures strict JSON parsing.
    - It is ideal for asserting empty objects/arrays or complex nested structures.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    expected = loads_json_or_fail(context.text)
    actual = get_json_path(context.response_json, path)
    assert actual == expected, f"Mismatch at '{path}'. Expected={expected} Actual={actual}"


@then("the response body should be empty")
def step_response_body_empty(context):
    """
    Validates that the HTTP response body is empty (after trimming whitespace).

    Use when:
    - Your API contract says the endpoint returns no body (often with 204 No Content).
    - You want to explicitly assert there is no content.

    Note:
    - This is different from "empty JSON" ({} or []).
    """
    assert getattr(context, "response", None) is not None, "No response found. Did you send a request?"
    body = context.response.text or ""
    assert body.strip() == "", f"Expected empty body, got: {body[:300]}"


@then("the response should be empty")
def step_response_should_be_empty(context):
    """
    Stronger empty-response assertion.
    Validates:
    - raw bytes length == 0
    - trimmed text is empty
    - Content-Length is '0' if present

    Use when:
    - You want a stricter check than just body.strip() == "".
    """
    assert getattr(context, "response", None) is not None, "No response found. Did you send a request?"
    resp = context.response

    # Raw bytes + text checks
    raw = resp.content or b""
    text = (resp.text or "").strip()

    # Content-Length header is optional
    content_length = resp.headers.get("Content-Length")

    assert len(raw) == 0 and text == "", (
        f"Expected empty response body, but got:\n"
        f"- status: {resp.status_code}\n"
        f"- content-type: {resp.headers.get('Content-Type')}\n"
        f"- content-length header: {content_length}\n"
        f"- bytes length: {len(raw)}\n"
        f"- text (first 300 chars): {(resp.text or '')[:300]}"
    )

    if content_length is not None:
        assert content_length.strip() == "0", f"Expected Content-Length '0', got '{content_length}'"


@then('the response JSON path "{path}" should be null')
def step_json_path_should_be_null(context, path: str):
    """
    Validates that a JSON field is explicitly null (None in Python).

    Example:
      Then the response JSON path "json" should be null

    Useful to assert:
    - An endpoint did not interpret the body as JSON (httpbin returns json:null)
    - Optional fields are absent or intentionally null
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    val = get_json_path(context.response_json, path)
    assert val is None, f"Expected '{path}' to be null, got: {val}"


@then('the response header "{header_name}" should be "{expected}"')
def step_assert_response_header(context, header_name: str, expected: str):
    """
    Behave step: Validates that the response JSON contains a header with a given value.

    This step reads context.response_json["headers"] and checks the header using
    case-insensitive matching (because HTTP headers are case-insensitive).

    Example in feature:
        Then the response header "X-Request-Id" should be "9f3a2c"

    Preconditions:
        - A request was already sent and context.response_json was parsed.
        - The endpoint returns a JSON object with a top-level "headers" field (httpbin does).

    Failure output:
        - If the header is missing, shows all headers returned by the server.
        - If the header exists but value differs, shows expected vs actual.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."

    # httpbin returns headers under a "headers" key
    headers = context.response_json.get("headers", {})
    assert isinstance(headers, dict), f"Expected 'headers' to be a dict, got {type(headers)}"

    actual = get_header_case_insensitive(headers, header_name)
    assert actual == expected, f"Expected header {header_name}='{expected}', got '{actual}'"


@then('the response JSON path "{path}" should match regex "{pattern}"')
def step_json_path_matches_regex(context, path: str, pattern: str):
    """
    Validates that a JSON field matches a regex.
    Example: batch_id format checks.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    val = get_json_path(context.response_json, path)
    assert isinstance(val, str), f"Expected '{path}' to be a string for regex match, got {type(val)} -> {val}"
    assert re.match(pattern, val), f"Value at '{path}' did not match regex.\nPattern: {pattern}\nValue: {val}"


@then("the response JSON should not be empty")
def step_response_json_should_not_be_empty(context):
    """
    Ensures the response contains a non-empty JSON payload.

    - If context.response_json is already available, it checks it is not {} or [].
    - If context.response_json is None, it tries to parse the response body as JSON.
    - Fails with a helpful message showing status, URL and a response snippet.
    """
    assert getattr(context, "response", None) is not None, "No response found. Did you send a request?"

    data = getattr(context, "response_json", None)

    # If JSON was not parsed in the request step, try parsing now.
    if data is None:
        raw = (context.response.text or "").strip()
        if raw == "":
            raise AssertionError(
                f"Expected non-empty JSON, but response body is empty.\n"
                f"Status: {context.response.status_code}\nURL: {context.response.url}"
            )
        try:
            data = json.loads(raw)
            context.response_json = data
        except Exception as e:
            raise AssertionError(
                f"Expected JSON but failed to parse it.\n"
                f"Error: {e}\n"
                f"Status: {context.response.status_code}\nURL: {context.response.url}\n"
                f"Body (first 500 chars): {raw[:500]}"
            )

    # Now validate it's not empty JSON object/array
    assert data not in ({}, [], ""), (
        f"Expected non-empty JSON, but got empty payload: {data}\n"
        f"Status: {context.response.status_code}\nURL: {context.response.url}"
    )


@then('I store the response JSON path "{path}" as "{var_name}"')
def step_store_response_json_path(context, path: str, var_name: str):
    """
    Stores a value from the last response JSON into context.vars so it can be reused
    later in the scenario (e.g., compare two batch_id values from consecutive calls).

    Example:
      Then I store the response JSON path "batch_id" as "batch_id_1"
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."

    value = get_json_path(context.response_json, path)

    # Create a variables dict if it doesn't exist yet
    if not hasattr(context, "vars") or context.vars is None:
        context.vars = {}

    context.vars[var_name] = value


@then('the stored variables "{var_a}" and "{var_b}" should be different')
def step_stored_vars_should_be_different(context, var_a: str, var_b: str):
    """
    Ensures two stored variables are not equal (e.g., batch_id uniqueness).
    """
    context.vars = getattr(context, "vars", {})
    a = context.vars.get(var_a)
    b = context.vars.get(var_b)

    assert a is not None and b is not None, f"Missing stored vars. {var_a}={a}, {var_b}={b}"
    assert a != b, f"Expected different values, but both were '{a}'"


@then("the response should indicate method not allowed")
def step_method_not_allowed(context):
    """
    Asserts the endpoint rejects an unsupported HTTP method.

    Why we accept multiple status codes:
    - 405 Method Not Allowed is the standard REST response.
    - 404 Not Found is sometimes returned by gateways/services to avoid endpoint discovery.
    """
    assert getattr(context, "response", None) is not None, "No response found. Did you send a request?"
    status = context.response.status_code
    assert status in (405, 404), f"Expected 405 or 404 for unsupported method, got {status}. Body: {context.response.text[:500]}"


@then('the response JSON path "{path}" should equal stored variable "{var_name}"')
def step_json_path_equals_stored_var(context, path: str, var_name: str):
    """
    Compares a JSON field with a value previously stored in context.vars.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."

    context.vars = getattr(context, "vars", {}) or {}
    expected = context.vars.get(var_name)
    assert expected is not None, f"Stored variable '{var_name}' not found in context.vars."

    actual = get_json_path(context.response_json, path)
    assert actual == expected, (
        f"JSON mismatch at '{path}'\n"
        f"Expected (stored {var_name}): {expected}\n"
        f"Actual: {actual}\n"
        f"Request: {context.last_request}"
    )