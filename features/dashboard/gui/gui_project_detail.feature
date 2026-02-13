@gui @project_detail
Feature: Project Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/projects/dashboard-monitor"
    Then the "project_detail" page is displayed

  @smoke @visual
  Scenario: Verify Architecture Analysis Section
    Then the "projectName" should be visible
    And I should see the text "[LANG:project_detail.layer_stability]"
    And I should see the text "[LANG:project_detail.layer_latency]"
    And I should see at least 1 elements with selector "stability_comparison"
    And I should see at least 1 elements with selector "latency_comparison"
    Then the "project architecture" page should visually match the baseline image "project_detail_architecture" without elements and with a 15.0% tolerance
      | element              |
      | stability_comparison |
      | latency_comparison   |

  @visual
  Scenario: Verify Execution Metrics and Trend
    Then the following elements should contain these texts
      | element         | value                               |
      | stability_score | [LANG:project_detail.stability_score] |
    And I should see the text "[LANG:project_detail.execution_velocity]"
    And I should see at least 1 elements with selector "velocity_trend"
    Then the "project_metrics" element should visually match the baseline image "project_detail_metrics" without elements and with a 15.0% tolerance
      | element                |
      | stability_score_value    |
      | pass_rate_value          |
      | avg_duration_value       |
      | total_flights_value      |
      | velocity_trend           |
      | distribution_chart       |
      | distribution_total_value |

  @visual
  Scenario: Verify Run History List
    Then I should see the text "[LANG:project_detail.execution_history]"
    And I should see at least 1 elements with selector "item"
    Then the "run_list" element should visually match the baseline image "project_detail_history" without elements and with a 15.0% tolerance
      | element |
      | item    |

  Scenario: Verify Dossier Download Button
    Then I should see at least 1 elements with selector "download_button"
