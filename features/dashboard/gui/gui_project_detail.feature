@gui @project_detail @smoke
Feature: Project Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 5 seconds
    When I click on the "test_runs_link" in the sidebar
    And I wait for 2 seconds
    When I click on the "project_card" in "test_runs"
    And I wait for 2 seconds

  Scenario: Verify Architecture Analysis Section
    Then the "projectName" in "project_detail" should be visible
    And I should see the text "[LANG:project_detail.layer_stability]"
    And I should see the text "[LANG:project_detail.layer_latency]"
    And I should see at least 1 elements with selector "stability_comparison" in "project_detail"
    And I should see at least 1 elements with selector "latency_comparison" in "project_detail"
    Then I take a screenshot named "project_detail_architecture"

  Scenario: Verify Execution Metrics and Trend
    Then the "stability_score" in "project_detail" should contain the text "[LANG:project_detail.stability_score]"
    And I should see the text "[LANG:project_detail.execution_velocity]"
    And I should see at least 1 elements with selector "velocity_trend" in "project_detail"
    Then I take a screenshot named "project_detail_metrics"

  Scenario: Verify Run History List
    Then I should see the text "[LANG:project_detail.execution_history]"
    And I should see at least 1 elements with selector "item" in "project_detail"
    Then I take a screenshot of the "run_list" named "project_detail_history"

  Scenario: Verify Dossier Download Button
    Then I should see at least 1 elements with selector "download_button" in "project_detail"
