@gui @export
Feature: Export Functionality Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for 2 seconds

  @critical
  Scenario: Download and Verify Executive Report
    When I click on the "actions_sync_button"
    And I wait for 3 seconds
    And I click on the "actions_export_button"
    And I wait for 10 seconds for the download to complete

    Then the downloaded executive report for today should exist
    And I verify the content of the first 2 pages of the downloaded executive report
