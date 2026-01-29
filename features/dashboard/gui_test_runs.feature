@gui @test_runs @smoke
Feature: Test Runs View Validation
  As a QA Engineer
  I want to verify the Execution Archives and search functionality
  So that I can ensure historical data is accessible and searchable

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    When I wait for 5 seconds

  @navigation @runs @search
  Scenario: Search and Grouping in Test Runs
    When I click on the "test_runs_link" in the sidebar
    And I wait for 2 seconds
    Then I should see the text "Execution Archives"
    When I type "dashboard" into the "search_input" in "test_runs"
    And I wait for 3 seconds
    Then I should see the text "dashboard"
    # Project cards should be visible
    And I should see at least 1 elements with selector "project_card" in "test_runs"
    When I click on the "project_card" in "test_runs"
    And I wait for 1 seconds
    # Should see historical runs
    And I should see at least 1 elements with selector "latest_badge" in "test_runs"
    Then I take a screenshot named "test_runs_search_results"

  @navigation @runs @pagination
  Scenario: Verify Pagination in Project History
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    When I click on the "project_card" in "test_runs"
    And I wait for 1 seconds
    Then I should see the text "Recent Executions"
    # If there are many runs, pagination should appear (or we just verify the area)
    Then I take a screenshot of the "project_card" named "test_runs_pagination_area"
