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
