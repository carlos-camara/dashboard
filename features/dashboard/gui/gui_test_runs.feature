@gui @test_runs @smoke
Feature: Test Runs View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Search and Redirect to Project Analytics
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the following elements should contain these texts:
      | element | value                      |
      | title   | [LANG:navigation.test_runs] |
    When I type "dashboard" into the "search_input"
    And I wait for 1 seconds
    Then the following elements should contain these texts:
      | element      | value     |
      | search_input | dashboard |
    # Select the project to go to detail view
    When I click on the "project_card"
    Then the "project_detail" page is displayed
    # Now in ProjectDetailView
    Then the "projectName" should be visible
    And I should see at least 1 elements with selector "stability_chart"
    Then I take a screenshot named "test_runs_project_redirection"

  Scenario: Verify Project List and Back Navigation
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I click on the "project_card"
    Then the "project_detail" page is displayed
    Then the following elements should contain these texts:
      | element  | value                          |
      | runCount | [LANG:project_detail.run_count] |
    # Go back to the registry
    When I click on the "back_button"
    Then the "test_runs" page is displayed
    Then I should see the text "[LANG:navigation.test_runs]"
