# Dashboard Page Objects - Locator Reference

## Overview
This document lists all available element locators defined in the `DashboardPage` class.

## Usage in Tests

Instead of hardcoding XPath or CSS selectors in feature files, use descriptive text that matches the locators defined here.

## Available Locators

### Header Elements
- **QA Hub Title**: Text "QA Hub"
- **Execution Dashboard**: Text "Execution Dashboard"

### Statistics Cards
- **Pass Rate**: Text "Pass Rate"
- **Total Runs**: Text "Total Runs"
- **Avg Duration**: Text "Avg Duration"

### Sections
- **Timeline**: Heading "Timeline"
- **Recent Runs**: Heading "Recent Runs"
- **Endpoints**: Text "Endpoints"

### Action Buttons
- **Sync**: Button "Sync"
- **7 Days Filter**: Button "7 Days"
- **30 Days Filter**: Button "30 Days"
- **All Time Filter**: Button "All Time"

## Adding New Locators

To add new element locators:

1. **Edit** `features/page_objects/dashboard_page.py`
2. **Add** new locator constant:
   ```python
   NEW_ELEMENT = (By.XPATH, "//your/xpath/here")
   ```
3. **Optionally** add a helper method:
   ```python
   def click_new_element(self):
       self.click(self.NEW_ELEMENT)
   ```

## Example Feature File Usage

```gherkin
# Good - Uses text matching locators
When I click on the button with text "Sync"
Then I should see the text "Timeline"

# Also works - Generic element click
When I click on the element with text "Recent Runs"
```

## Page Object Structure

```
features/
├── page_objects/
│   ├── __init__.py           # Package init
│   ├── base_page.py          # Base class with common methods
│   └── dashboard_page.py     # Dashboard-specific locators
└── steps/
    └── step_gui_interactions.py  # Uses page objects
```

## Benefits

✅ **Centralized Maintenance**: Update locators in one place  
✅ **Reusability**: Same locators across multiple tests  
✅ **Readability**: Descriptive names instead of XPath  
✅ **Type Safety**: IDE autocomplete for locators  
✅ **Easier Debugging**: Clear separation of concerns
