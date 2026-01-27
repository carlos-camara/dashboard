@gui @smoke
Feature: Dashboard UI Validation
  As a QA Engineer
  I want to verify that the Dashboard UI is correctly loaded
  So that I can ensure the application is accessible and correctly branded

  Scenario: Verify Dashboard Page Title
    Given I navigate to the dashboard at "http://localhost:3000"
    Then the page title should be "QA Hub - Execution Dashboard"
