@gui @navigation @smoke
Feature: Application Navigation Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"

  Scenario: Navigate to all main sections
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 2 seconds
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    Then the "title" in "test_runs" should contain the text "EXECUTION ARCHIVES"
    Then I take a screenshot named "nav_test_runs"

    When I click on the "endpoints_link" in the sidebar
    And I wait for 1 seconds
    Then the "title" in "endpoints_view" should contain the text "ENDPOINT CATALOG"
    Then I take a screenshot named "nav_endpoints"

    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds
    Then the "title" in "incidents.header" should contain the text "INCIDENT TAXONOMY"
    Then I take a screenshot named "nav_incidents"

    When I click on the "dashboard_link" in the sidebar
    And I wait for 1 seconds
    Then the "subtitle" in "dashboard.header" should contain the text "DASHBOARD CLUSTER"
    Then I take a screenshot named "nav_dashboard_return"

  Scenario: Sidebar navigation persistence
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    When I click on the "dashboard_link" in the sidebar
    And I wait for 1 seconds
    Then the "subtitle" in "dashboard.header" should contain the text "DASHBOARD CLUSTER"
    Then I take a screenshot named "nav_sidebar_persistence"
