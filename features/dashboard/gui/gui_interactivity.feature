@gui @interactivity
Feature: Dashboard Cross-Navigation Interactivity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  @CC-288
  Scenario: Redirect from Sector Integrity to Project Detail
    Then the following elements should contain these texts
         | element             | value            |
         | recent_runs_heading | Sector Integrity |
    When I click on the "recent_runs_project_item"
    Then the "project_detail" page is displayed
    Then the "projectName" should be visible
    And I should see at least 1 elements with selector "stability_comparison"

  @visual
  @CC-449
  Scenario: Redirect from Latency Anomalies to Endpoint Detail
    When I scroll to the bottom of the page
    Then the following elements should contain these texts
         | element           | value             |
         | endpoints_heading | LATENCY ANOMALIES |
    When I click on the "endpoints_anomaly_item"
    Then the "endpoint_detail" page is displayed
    Then the following elements should contain these texts
         | element     | value           |
         | back_button | Back to Catalog |
    And I should see the text "Success Rate"
    And I should see the text "Avg Latency"
