@gui @performance @smoke
Feature: Performance Insights and Report Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    And I wait for 2 seconds

  @performance @detail @integration
  Scenario: Validate Performance Insights and Integrated Report
    # Navigate to Endpoints
    When I click on the "endpoints_link" in the sidebar
    And I wait for 1 seconds
    
    # Select an endpoint (dashboard service is a good bet for existing results)
    When I type "dashboard" into the "search_input" in "endpoints_view"
    And I wait for 1 seconds
    When I click on the "endpoint_item" in "endpoints_view"
    And I wait for 1 seconds
    
    # Verify Performance Insights Card is visible
    Then I should see the "performance_card" in "endpoint_detail"
    And I should see the text "Performance Insights"
    And I should see the text "RPS (Load)"
    
    # Deep dive into full report
    When I click on the "open_report_button" in "endpoint_detail"
    And I wait for 2 seconds
    
    # Verify we are in the integrated Analysis view
    Then I should see the "analysis_title" in "performance_report_view"
    And I should see the text "Analysis Engine"
    
    # Verify the iframe is present and loaded
    Then I should see at least 1 elements with selector "report_iframe" in "performance_report_view"
    
    # Check export button exists
    Then I should see the "export_button" in "performance_report_view"
    
    # Take a screenshot of the premium report view
    Then I take a screenshot named "performance_analysis_report"
    
    # Navigate back to endpoint detail
    When I click on the "back_button" in "performance_report_view"
    And I wait for 1 seconds
    Then I should see the text "Back to Catalog"
    And I should see the "performance_card" in "endpoint_detail"
    
    # Final check
    Then I take a screenshot named "returned_to_endpoint_detail"
