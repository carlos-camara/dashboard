@gui @test_runs
Feature: Test Runs View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  @smoke
  Scenario: Search and Redirect to Project Analytics
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the following elements should contain these texts
      | element | value                      |
      | title   | [LANG:navigation.test_runs] |
    When I type "dashboard" into the "search_input"
    And I wait for 1 seconds
    Then the following elements should contain these texts
      | element      | value     |
      | search_input | dashboard |
    When I click on the "project_card"
    Then the "project_detail" page is displayed
    Then the "projectName" should be visible
    And I should see at least 1 elements with selector "stability_chart"
    Then the "test runs redirection" page should visually match the baseline image "test_runs_project_redirection" without elements and with a 5.0% tolerance
      | element               |
      | stability_chart       |
      | stability_score_value |
      | velocity_trend        |

  @visual
  Scenario: Verify Project List and Back Navigation
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the "test runs list" page should visually match the baseline image "nav_test_runs" without elements and with a 5.0% tolerance
      | element               |
      | active_projects_count |
      | project_flights_count |
      | project_last_activity |
      | project_pass_rate     |
    
    When I click on the "project_card"
    Then the "project_detail" page is displayed
    Then the following elements should contain these texts
      | element  | value                          |
      | runCount | [LANG:project_detail.run_count] |
    When I click on the "back_button"
    Then the "test_runs" page is displayed
    Then I should see the text "[LANG:navigation.test_runs]"
