from behave import then
import json

@then('the response JSON path "{json_path}" should equal "{expected_value}"')
def step_verify_response_json_path_equals(context, json_path, expected_value):
    """
    Verify that a specific path in the JSON response equals the expected value.
    Supports dot notation for nested objects and array indices (e.g., "0.id", "users.0.name").
    """
    # Ensure response exists
    if not hasattr(context, "response"):
        raise AssertionError("No response found in context. Did you run a request step?")
    
    try:
        json_data = context.response.json()
    except Exception as e:
        raise AssertionError(f"Failed to parse response as JSON: {e}")

    # Navigate the path
    current_data = json_data
    keys = json_path.split('.')
    
    traversed_path = ""
    
    for key in keys:
        traversed_path += f".{key}" if traversed_path else key
        
        # Handle list indices (digits)
        if isinstance(current_data, list):
            try:
                idx = int(key)
                current_data = current_data[idx]
            except (ValueError, IndexError):
                raise AssertionError(f"Path '{traversed_path}' not found or invalid index for list.")
        # Handle dictionary keys
        elif isinstance(current_data, dict):
            if key in current_data:
                current_data = current_data[key]
            else:
                raise AssertionError(f"Key '{key}' not found in path '{traversed_path}'. Available keys: {list(current_data.keys())}")
        else:
             raise AssertionError(f"Cannot navigate path '{traversed_path}' on primitive type: {type(current_data)}")

    # Compare values
    # We cast current_data to string for comparison since expected_value is a string from the Gherkin step
    # This might need refinement for other types, but "should equal" usually implies strict or string matching in basic BDD.
    # For now, let's normalize both to strings for simple equality.
    assert str(current_data) == expected_value, f"Expected path '{json_path}' to be '{expected_value}', but got '{current_data}'"
