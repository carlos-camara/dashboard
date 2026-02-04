@gui @endpoints @smoke
Feature: Endpoints Catalog Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Deep Dive into Endpoint Detail
    When I click on the "endpoints_link" in the sidebar
    Then the "endpoints_view" page is displayed
    When I type "health" into the "search_input"
    And I wait for 1 seconds
    When I click on the "endpoint_item"
    Then the "endpoint_detail" page is displayed
    Then the following elements should contain these texts:
      | element     | value                             |
      | back_button | [LANG:endpoints.detail.back_button] |
    And I should see the text "[LANG:endpoints.detail.success_rate]"
    And I should see the text "[LANG:endpoints.detail.avg_latency]"
    And I should see the "performance_card"
    And I should see the text "[LANG:endpoints.detail.performance_insights]"
    And I should see the text "[LANG:endpoints.detail.live_discovery]"
    Then the "endpoint detail" page should visually match the baseline image "endpoints_deep_detail" with a 5.0% tolerance
    When I click on the "back_button"
    Then the "endpoints_view" page is displayed
    Then the "title" should contain the text "[LANG:endpoints.view.title]"
