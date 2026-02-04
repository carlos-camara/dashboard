@gui @project_detail @smoke
Feature: Project Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I click on the "project_card"
    Then the "project_detail" page is displayed

  Scenario: Verify Architecture Analysis Section
    Then the "projectName" should be visible
    And I should see the text "[LANG:project_detail.layer_stability]"
    And I should see the text "[LANG:project_detail.layer_latency]"
    And I should see at least 1 elements with selector "stability_comparison"
    And I should see at least 1 elements with selector "latency_comparison"
    Then I take a screenshot named "project_detail_architecture"

  Scenario: Verify Execution Metrics and Trend
    Then the following elements should contain these texts:
      | element         | value                               |
      | stability_score | [LANG:project_detail.stability_score] |
    And I should see the text "[LANG:project_detail.execution_velocity]"
    And I should see at least 1 elements with selector "velocity_trend"
    Then I take a screenshot named "project_detail_metrics"

  Scenario: Verify Run History List
    Then I should see the text "[LANG:project_detail.execution_history]"
    And I should see at least 1 elements with selector "item"
    Then I take a screenshot of the "run_list" named "project_detail_history"

  Scenario: Verify Dossier Download Button
    Then I should see at least 1 elements with selector "download_button"
