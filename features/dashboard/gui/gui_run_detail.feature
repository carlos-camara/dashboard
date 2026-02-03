@gui @run_detail @smoke
Feature: Run Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 2 seconds

  Scenario: Explore Run Detail View
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    When I click on the "project_card" in "test_runs"
    And I wait for 1 seconds
    When I click on the "item" in "project_detail"
    And I wait for 1 seconds
    Then the "back_button" in "run_detail" should contain the text "[LANG:run_detail.return_to_base]"
    And I should see the text "[LANG:run_detail.success]"
    Then I take a screenshot named "run_detail_full_view"
    When I click on the "filter_failed" in "run_detail"
    And I wait for 1 seconds
    Then I take a screenshot named "run_detail_filtered_failed"
