@gui @interactivity @smoke
Feature: Dashboard Cross-Navigation Interactivity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 5 seconds

  Scenario: Redirect from Sector Integrity to Project Detail
    Then the "heading" in "dashboard.recent_runs" should contain the text "Sector Integrity"
    When I click on the "project_item" in "dashboard.recent_runs"
    And I wait for 2 seconds
    Then the "projectName" in "project_detail" should be visible
    And I should see at least 1 elements with selector "stability_comparison" in "project_detail"
    Then I take a screenshot named "interactivity_sector_redirect"

  Scenario: Redirect from Latency Anomalies to Endpoint Detail
    When I scroll to the bottom of the page
    Then the "heading" in "dashboard.endpoints" should contain the text "LATENCY ANOMALIES"
    When I click on the "anomaly_item" in "dashboard.endpoints"
    And I wait for 1 seconds
    Then the "back_button" in "endpoint_detail" should contain the text "Back to Catalog"
    And I should see the text "Success Rate"
    And I should see the text "Avg Latency"
    Then I take a screenshot named "interactivity_anomaly_redirect"
