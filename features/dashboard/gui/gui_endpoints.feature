@gui @endpoints @smoke
Feature: Endpoints Catalog Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 2 seconds

  Scenario: Deep Dive into Endpoint Detail
    When I click on the "endpoints_link" in the sidebar
    And I wait for 1 seconds
    When I type "health" into the "search_input" in "endpoints_view"
    And I wait for 2 seconds
    When I click on the "endpoint_item" in "endpoints_view"
    And I wait for 1 seconds
    Then the "back_button" in "endpoint_detail" should contain the text "Back to Catalog"
    And I should see the text "Success Rate"
    And I should see the text "Avg Latency"
    And I should see the "performance_card" in "endpoint_detail"
    And I should see the text "Performance Insights"
    And I should see the text "Live Discovery Data"
    Then I take a screenshot named "endpoints_deep_detail"
    When I click on the "back_button" in "endpoint_detail"
    And I wait for 1 seconds
    Then the "title" in "endpoints_view" should contain the text "Endpoint Catalog"
