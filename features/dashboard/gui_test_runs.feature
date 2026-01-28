@gui @test_runs @smoke
Feature: Test Runs View Validation
  As a QA Engineer
  I want to verify the Execution Archives and search functionality
  So that I can ensure historical data is accessible and searchable

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    When I wait for 2 seconds

  @navigation @archives
  Scenario: Navigate to Execution Archives and Search
    When I click on the "test_runs_link" in the sidebar
    And I wait for 1 seconds
    Then I should see the text "Execution Archives"
    And I should see at least 1 elements with selector "project_card" in "test_runs"
    When I type "dashboard" into the "search_input" in "test_runs"
    And I wait for 1 seconds
    Then I take a screenshot named "archives_search_results"
