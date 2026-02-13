@gui @run_detail
Feature: Run Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Explore Run Detail View
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I click on the "project_card"
    Then the "project_detail" page is displayed
    When I click on the "item"
    Then the "run_detail" page is displayed
    Then the following elements should contain these texts
      | element     | value                          |
      | back_button | [LANG:run_detail.return_to_base] |
    And I should see the text "[LANG:run_detail.success]"
    Then the "run detail" page should visually match the baseline image "run_detail_full_view" without elements and with a 5.0% tolerance
      | element              |
      | score_percentage     |
      | metrics_duration     |
      | metrics_avg_duration |
      | metrics_steps        |
      | metrics_timestamp    |
      | passed_count         |
      | failed_count         |
      | scenario_card        |

    When I click on the "filter_failed"
    And I wait for 1 seconds
    Then the "run detail filtered" page should visually match the baseline image "run_detail_filtered_failed" without elements and with a 5.0% tolerance
      | element               |
      | score_percentage      |
      | metrics_duration      |
      | metrics_avg_duration  |
      | metrics_steps         |
      | metrics_timestamp     |
      | passed_count          |
      | failed_count          |
      | failure_analysis_log  |
      | scenario_card         |
