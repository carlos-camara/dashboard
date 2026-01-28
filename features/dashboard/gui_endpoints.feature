@gui @endpoints @smoke
Feature: Endpoints Catalog Validation
  As a QA Engineer
  I want to verify the API Registry and advanced filters
  So that I can effectively monitor API interface health

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    When I wait for 2 seconds

  @navigation @endpoints
  Scenario: Verify Endpoints Catalog and Filters
    When I click on the "endpoints_link" in the sidebar
    And I wait for 1 seconds
    Then I should see the text "Endpoint Catalog"
    When I click on the "advanced_filters_toggle" in "endpoints_view"
    And I wait for 1 seconds
    Then I should see the text "Service Infrastructure"
    Then I take a screenshot named "endpoints_advanced_filters"
