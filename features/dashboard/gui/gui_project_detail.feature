@gui @project_detail
Feature: Project Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I click on the "project_card"
    Then the "project_detail" page is displayed

  @smoke
  @CC-203
  Scenario: Verify Architecture Analysis Section
    Then the "projectName" should be visible
    And I should see the text "[LANG:project_detail.layer_stability]"
    And I should see the text "[LANG:project_detail.layer_latency]"
    And I should see at least 1 elements with selector "stability_comparison"
    And I should see at least 1 elements with selector "latency_comparison"

  @visual
  @CC-204
  Scenario: Verify Execution Metrics and Trend
    Then the following elements should contain these texts
         | element         | value                                 |
         | stability_score | [LANG:project_detail.stability_score] |
    And I should see the text "[LANG:project_detail.execution_velocity]"
    And I should see at least 1 elements with selector "velocity_trend"
    Then the "project_metrics" element should visually match the baseline image "project_detail_metrics" without elements and with a 15.0% tolerance
         | element                  |
         | stability_score_value    |
         | pass_rate_value          |
         | avg_duration_value       |
         | total_flights_value      |
         | velocity_trend           |
         | distribution_chart       |
         | distribution_total_value |

  @CC-205
  Scenario: Verify Run History List
    Then I should see the text "[LANG:project_detail.execution_history]"
    And I should see at least 1 elements with selector "item"
  
  @CC-206
  Scenario: Verify Dossier Download Button
    Then I should see at least 1 elements with selector "download_button"
