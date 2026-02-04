@gui @performance @smoke
Feature: Ultra-Professional Performance Dashboard Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Validate High-Density Performance Audit Dossier
    When I click on the "endpoints_link" in the sidebar
    Then the "endpoints_view" page is displayed
    When I type "runs" into the "search_input"
    And I wait for 1 seconds
    When I click on the "endpoint_item"
    Then the "endpoint_detail" page is displayed
    Then I should see the "performance_card"
    When I click on the "open_report_button"
    Then the "performance_report_view" page is displayed
    Then I should see the "audit_title"
    And the "audit_title" should contain the text "[LANG:performance.audit_title]"
    And the "export_button" should contain the text "[LANG:performance.dossier]"
    And I should see the text "[LANG:performance.integrity]"
    And I should see the "rps_image"
    And I should see the "latency_image"
    And I should see the "original_report_link"
    Then I take a screenshot named "final_performance_dashboard_verification"
