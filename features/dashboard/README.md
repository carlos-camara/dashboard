# Dashboard GUI Tests

This directory contains visual/GUI tests for the QA Hub Dashboard using Selenium and BDD.

## Test Files

- **`title_validation.feature`** - Basic page title validation
- **`dashboard_visual.feature`** - Comprehensive visual validation tests

## Running GUI Tests

### Run all GUI tests:
```bash
behave features/dashboard --tags=@gui
```

### Run only smoke GUI tests:
```bash
behave features/dashboard --tags="@gui and @smoke"
```

### Run specific test categories:
```bash
# Navigation tests
behave features/dashboard --tags=@navigation

# Component visibility tests
behave features/dashboard --tags=@components

# Interaction tests
behave features/dashboard --tags=@interaction

# Screenshot tests
behave features/dashboard --tags=@visual
```

## Screenshots

All screenshots are automatically saved to:
```
features/resources/screenshots/
```

Screenshot naming format: `{name}_{timestamp}.png`

## Test Scenarios

### Navigation Tests
- Dashboard loads successfully
- Page title verification
- URL validation

### Component Tests
- Statistics cards visibility
- Timeline chart presence
- Recent runs section
- Endpoints catalog

### Interaction Tests
- Sync button functionality
- Time filter buttons (7 Days, 30 Days, All Time)
- Navigation to run details

### Visual Tests
- Full page screenshots
- Header/footer validation
- Responsive design checks

## Prerequisites

- Dashboard server running on `http://localhost:3000`
- Chrome browser installed
- ChromeDriver in PATH or configured in environment.py

## Step Definitions

GUI-specific steps are defined in:
- `features/steps/step_gui_validation.py` - Basic navigation and title checks
- `features/steps/step_gui_interactions.py` - Advanced interactions and screenshots
