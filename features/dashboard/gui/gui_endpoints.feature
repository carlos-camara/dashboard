@gui @endpoints
Feature: Endpoints Catalog & Insights

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for "dashboard" to be stable

  @interactive
  Scenario: Analyze Endpoint Details
    When I click on the "endpoints_link" in the sidebar
    Then the "endpoints_view" page is displayed
    
    When I type "health" into the "search_input"
    And I wait for "list" to update
    
    When I click on the "endpoint_item"
    Then the "endpoint_detail" page is displayed
    
    Then the following elements should contain these texts
      | element     | value                             |
      | back_button | [LANG:endpoints.detail.back_button] |
    
    And I should see the text "[LANG:endpoints.detail.success_rate]"
    And I should see the text "[LANG:endpoints.detail.avg_latency]"
    And I should see the "performance_card"
    
    # Verify semantic sections exist
    And I should see the text "[LANG:endpoints.detail.performance_insights]"
    And I should see the text "[LANG:endpoints.detail.live_discovery]"
    
    Then the "endpoint detail" page should visually match the baseline image "endpoints_deep_detail" without elements and with a 15.0% tolerance
      | element            |
      | success_rate_value |
      | avg_latency_value  |
      | performance_card   |
    
    When I click on the "back_button"
    Then the "endpoints_view" page is displayed
    And the "title" should contain the text "[LANG:endpoints.view.title]"
