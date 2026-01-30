@gui @export @wip
Feature: Export Functionality Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 2 seconds

  @critical
  Scenario: Download and Verify Executive Report
    When I click on the "export_button" in "actions"
    And I wait for 5 seconds for the download to complete
    Then the downloaded file "SENTINEL_EXECUTIVE_REPORT_2026-01-29.pdf" should exist
    And the PDF "SENTINEL_EXECUTIVE_REPORT_2026-01-29.pdf" should have at least 2 pages
    And I verify the content of the first 2 pages of "SENTINEL_EXECUTIVE_REPORT_2026-01-29.pdf"
