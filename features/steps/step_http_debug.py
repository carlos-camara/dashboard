from behave import then
import json

@then("I print the response JSON")
def step_print_response_json(context):
    """
    Debug/diagnostic step.

    Prints the parsed JSON body stored in context.response_json in a readable format.
    Useful when:
      - a JSON-path assertion is failing and you want to see the actual payload
      - you suspect the endpoint returned an unexpected structure (e.g., json=null)
      - you are authoring new tests and need to inspect response fields

    Notes:
      - Requires that a previous request step successfully parsed JSON into context.response_json.
      - To actually see print output in terminal/CI, run Behave with:
          behave --no-capture
        or ensure stdout_capture=false in behave.ini.
    """
    assert context.response_json is not None, "Response JSON is empty or could not be parsed."
    print("\n===== RESPONSE JSON =====")
    # sort_keys=True helps keep output stable across runs; good for comparing logs.
    print(json.dumps(context.response_json, indent=2, ensure_ascii=False, sort_keys=True))
    print("=========================\n")


@then("I print the request headers")
def step_print_request_headers(context):
    """
    Debug/diagnostic step.

    Prints the actual HTTP request headers that were sent on the last call.
    Useful when:
      - a header-based assertion fails (e.g., custom headers not being sent)
      - you want to confirm default headers added by the HTTP client (Accept, User-Agent, etc.)
      - troubleshooting why a server behaves differently in CI vs local

    Implementation detail:
      - requests.Response keeps a reference to the prepared request in response.request.
      - Those headers are the final headers after merging:
          context.default_headers + any library defaults.

    Tip:
      - If you set headers via "I set request headers", print this to confirm they were applied.
    """
    assert context.response is not None, "No response found. Did you send a request?"
    sent_headers = dict(context.response.request.headers)
    print("\n===== REQUEST HEADERS (sent) =====")
    print(json.dumps(sent_headers, indent=2, ensure_ascii=False, sort_keys=True))
    print("==================================\n")