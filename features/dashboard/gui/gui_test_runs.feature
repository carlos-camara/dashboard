@gui @test_runs @smoke
Feature: Test Runs View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 5 seconds

  Scenario: Search and Redirect to Project Analytics
    When I click on the "test_runs_link" in the sidebar
    And I wait for 2 seconds
    Then the "title" in "test_runs" should contain the text "EXECUTION ARCHIVES"
    When I type "dashboard" into the "search_input" in "test_runs"
    And I wait for 3 seconds
    Then the "search_input" in "test_runs" should contain the text "dashboard"
    # Select the project to go to detail view
    When I click on the "project_card" in "test_runs"
    And I wait for 2 seconds
    # Now in ProjectDetailView
    Then the "projectName" in "project_detail" should be visible
    And I should see at least 1 elements with selector "stability_chart" in "project_detail"
    Then I take a screenshot named "test_runs_project_redirection"

  Scenario: Verify Project List and Back Navigation
    When I click on the "test_runs_link" in the sidebar
    And I wait for 2 seconds
    When I click on the "project_card" in "test_runs"
    And I wait for 2 seconds
    Then the "runCount" in "project_detail" should contain the text "RUNS DETECTED"
    # Go back to the registry
    When I click on the "back_button" in "project_detail"
    And I wait for 1 seconds
    Then I should see the text "EXECUTION ARCHIVES"
