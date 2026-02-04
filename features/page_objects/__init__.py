"""
Page Objects package - Locator-based approach

This project uses YAML-driven locators instead of traditional Python page classes.
All locators are defined in the 'locators/' subdirectory as YAML files.

The qa-hub-framework handles locator resolution automatically through:
- qa_framework.utils.locator_handler.LocatorHandler
- Generic steps in qa_framework.steps.gui_steps
"""

# No Python page classes needed - using YAML locators exclusively
