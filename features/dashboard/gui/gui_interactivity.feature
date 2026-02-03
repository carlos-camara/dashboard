@gui @interactivity @smoke
Feature: Dashboard Cross-Navigation Interactivity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for 5 seconds

  Scenario: Redirect from Sector Integrity to Project Detail
    Then the "recent_runs_heading" should contain the text "Sector Integrity"
    When I click on the "recent_runs_project_item"
    And I wait for 2 seconds
    Then the "project_detail" page is displayed
    Then the "projectName" should be visible
    And I should see at least 1 elements with selector "stability_comparison"
    Then I take a screenshot named "interactivity_sector_redirect"

  Scenario: Redirect from Latency Anomalies to Endpoint Detail
    When I scroll to the bottom of the page
    Then the "endpoints_heading" should contain the text "LATENCY ANOMALIES"
    When I click on the "endpoints_anomaly_item"
    And I wait for 1 seconds
    Then the "endpoint_detail" page is displayed
    Then the "back_button" should contain the text "Back to Catalog"
    And I should see the text "Success Rate"
    And I should see the text "Avg Latency"
    Then I take a screenshot named "interactivity_anomaly_redirect"
