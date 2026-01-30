@gui @interactivity @smoke
Feature: Dashboard Cross-Navigation Interactivity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 5 seconds

  @navigation @sector_integrity
  Scenario: Redirect from Sector Integrity to Filtered Test Runs
    Then I should see the text "Sector Integrity"
    When I click on the "project_item" in "dashboard.recent_runs"
    And I wait for 1 seconds
    Then I should see the text "Execution Archives"
    And I should see at least 1 elements with selector "project_card" in "test_runs"
    And I should see at least 1 elements with class "bg-blue-600"
    Then I take a screenshot named "interactivity_sector_redirect"

  @navigation @latency_anomalies
  Scenario: Redirect from Latency Anomalies to Endpoint Detail
    When I scroll to the bottom of the page
    Then I should see the text "Latency Anomalies"
    When I click on the "anomaly_item" in "dashboard.endpoints"
    And I wait for 1 seconds
    Then I should see the text "Back to Catalog"
    And I should see the text "Success Rate"
    And I should see the text "Avg Latency"
    Then I take a screenshot named "interactivity_anomaly_redirect"
