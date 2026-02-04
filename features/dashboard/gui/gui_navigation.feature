@gui @navigation @smoke
Feature: Application Navigation Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Navigate to all main sections
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the "title" should contain the text "[LANG:navigation.test_runs]"
    Then the "test runs section" page should visually match the baseline image "nav_test_runs" with a 5.0% tolerance

    When I click on the "endpoints_link" in the sidebar
    Then the "endpoints_view" page is displayed
    Then the "title" should contain the text "[LANG:navigation.endpoints]"
    Then the "endpoints section" page should visually match the baseline image "nav_endpoints" with a 5.0% tolerance

    When I click on the "incidents_link" in the sidebar
    Then the "incidents" page is displayed
    Then the "header_title" should contain the text "[LANG:navigation.incidents]"
    Then the "incidents section" page should visually match the baseline image "nav_incidents" with a 5.0% tolerance

    When I click on the "dashboard_link" in the sidebar
    Then the "dashboard" page is displayed
    Then the following elements should contain these texts:
      | element         | value                            |
      | header_subtitle | [LANG:dashboard.header.subtitle] |
    Then the "dashboard return" page should visually match the baseline image "nav_dashboard_return" with a 5.0% tolerance

  Scenario: Sidebar navigation persistence
    When I click on the "test_runs_link" in the sidebar
    When I click on the "dashboard_link" in the sidebar
    Then the "dashboard" page is displayed
    Then the following elements should contain these texts:
      | element         | value                            |
      | header_subtitle | [LANG:dashboard.header.subtitle] |
    Then the "sidebar persistence" page should visually match the baseline image "nav_sidebar_persistence" with a 5.0% tolerance
