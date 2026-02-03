@gui @navigation @smoke
Feature: Application Navigation Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Navigate to all main sections
    And I wait for 2 seconds
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    Then the "test_runs" page is displayed
    Then the "title" should contain the text "[LANG:navigation.test_runs]"
    Then I take a screenshot named "nav_test_runs"

    When I click on the "endpoints_link" in the sidebar
    And I wait for 1 seconds
    Then the "endpoints_view" page is displayed
    Then the "title" should contain the text "[LANG:navigation.endpoints]"
    Then I take a screenshot named "nav_endpoints"

    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds
    Then the "incidents" page is displayed
    Then the "header_title" should contain the text "[LANG:navigation.incidents]"
    Then I take a screenshot named "nav_incidents"

    When I click on the "dashboard_link" in the sidebar
    And I wait for 1 seconds
    Then the "dashboard" page is displayed
    Then the "header_subtitle" should contain the text "[LANG:dashboard.header.subtitle]"
    Then I take a screenshot named "nav_dashboard_return"

  Scenario: Sidebar navigation persistence
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    When I click on the "dashboard_link" in the sidebar
    And I wait for 1 seconds
    Then the "dashboard" page is displayed
    Then the "header_subtitle" should contain the text "[LANG:dashboard.header.subtitle]"
    Then I take a screenshot named "nav_sidebar_persistence"
