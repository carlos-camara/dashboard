@gui @run_detail @smoke
Feature: Run Detail View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    When I wait for 2 seconds

  Scenario: Explore Run Detail View
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    Then the "test_runs" page is displayed
    When I click on the "project_card"
    And I wait for 1 seconds
    Then the "project_detail" page is displayed
    When I click on the "item"
    And I wait for 1 seconds
    Then the "run_detail" page is displayed
    Then the "back_button" should contain the text "[LANG:run_detail.return_to_base]"
    And I should see the text "[LANG:run_detail.success]"
    Then I take a screenshot named "run_detail_full_view"
    When I click on the "filter_failed"
    And I wait for 1 seconds
    Then I take a screenshot named "run_detail_filtered_failed"
