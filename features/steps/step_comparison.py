from behave import then

@then(u'the response JSON path "{json_path}" should be >= {value:d}')
def step_impl(context, json_path, value):
    actual_value = context.response_json.get(json_path)
    assert actual_value is not None, f"JSON path '{json_path}' not found in response"
    assert isinstance(actual_value, (int, float)), f"Expected number at '{json_path}', got {type(actual_value)}"
    assert actual_value >= value, f"Expected '{json_path}' to be >= {value}, but got {actual_value}"
