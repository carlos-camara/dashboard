@gui @performance @smoke
Feature: Ultra-Professional Performance Dashboard Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 5 seconds

  @performance @detail @integration
  Scenario: Validate High-Density Performance Audit Dossier
    When I click on the "endpoints_link" in the sidebar
    And I wait for 2 seconds
    When I type "runs" into the "search_input" in "endpoints_view"
    And I wait for 2 seconds
    When I click on the "endpoint_item" in "endpoints_view"
    And I wait for 2 seconds
    Then I should see the "performance_card" in "endpoint_detail"
    When I click on the "open_report_button" in "endpoint_detail"
    And I wait for 10 seconds
    Then I should see the "audit_title" in "performance_report_view"
    And I should see the text "Performance"
    And I should see the text "Dossier"
    And I should see the text "Integrity"
    And I should see the "rps_image" in "performance_report_view"
    And I should see the "latency_image" in "performance_report_view"
    And I should see the "original_report_link" in "performance_report_view"
    Then I take a screenshot named "final_performance_dashboard_verification"
