@gui @performance
Feature: Ultra-Professional Performance Dashboard Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
  @visual
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
    Then the following elements should contain these texts
      | element       | value                          |
      | audit_title   | [LANG:performance.audit_title] |
      | export_button | [LANG:performance.dossier]     |
    And I should see the text "[LANG:performance.integrity]"
    And I should see the "rps_image"
    And I should see the "latency_image"
    And I should see the "original_report_link"
    Then the "performance dashboard" page should visually match the baseline image "final_performance_dashboard_verification" with a 10.0% tolerance
      | element               |
      | efficiency_score      |
      | velocity_score        |
      | integrity_score       |
      | saturation_score      |
      | rps_image             |
      | latency_image         |
      | audit_timestamp_value |
      | endpoint_matrix       |
