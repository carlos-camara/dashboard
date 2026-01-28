@gui @run_detail @smoke
Feature: Run Detail View Validation
  As a QA Engineer
  I want to explore the details of a specific test run
  So that I can diagnose failures and analyze performance metrics

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    When I wait for 2 seconds

  @navigation @detail
  Scenario: Explore Run Detail View
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    When I click on the "project_card" in "test_runs"
    And I wait for 1 seconds
    When I click on the "latest_badge" in "test_runs"
    And I wait for 1 seconds
    Then I should see the text "Return to Base"
    And I should see the text "Success"
    Then I take a screenshot named "run_detail_full_view"
    When I click on the "filter_failed" in "run_detail"
    And I wait for 1 seconds
    Then I take a screenshot named "run_detail_filtered_failed"
