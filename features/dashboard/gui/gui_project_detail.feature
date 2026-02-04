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
    Then the "project architecture" page should visually match the baseline image "project_detail_architecture" with a 5.0% tolerance

  Scenario: Verify Execution Metrics and Trend
    Then the following elements should contain these texts:
      | element         | value                               |
      | stability_score | [LANG:project_detail.stability_score] |
    And I should see the text "[LANG:project_detail.execution_velocity]"
    And I should see at least 1 elements with selector "velocity_trend"
    Then the "project metrics" page should visually match the baseline image "project_detail_metrics" with a 5.0% tolerance

  Scenario: Verify Run History List
    Then I should see the text "[LANG:project_detail.execution_history]"
    And I should see at least 1 elements with selector "item"
    Then the "run history" element should visually match the baseline image "project_detail_history" with a 5.0% tolerance

  Scenario: Verify Dossier Download Button
    Then I should see at least 1 elements with selector "download_button"
