@gui @dashboard @smoke
Feature: Dashboard Overview & Visual Integrity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for "dashboard" to be stable

  @visual
  Scenario: Validate Header and System Status
    Then the page title should be "[LANG:common.page_title]"
    And the "header_subtitle" element should contain text "[LANG:dashboard.header.subtitle]"
    And the system status should be valid
    And the "header status" page should visually match the baseline image "dashboard_header_status" with a 15.0% tolerance

  @visual @critical
  Scenario: Validate Statistics Key Metrics
    Then the following elements should contain these texts
      | element             | value                                     |
      | stats_passed_card   | [LANG:dashboard.stats.system_health]      |
      | stats_total_runs    | [LANG:dashboard.stats.total_executions]   |
      | stats_pass_rate     | [LANG:dashboard.stats.pass_rate]          |
      | stats_avg_duration  | [LANG:dashboard.stats.avg_latency]        |
    And the "stats grid" element should visually match the baseline image "dashboard_stats_grid" with a 15.0% tolerance

  @interactive
  Scenario: Validate Timeline Chart Interactions
    Then the "timeline_heading" element should contain text "[LANG:dashboard.timeline.heading]"
    And I should see at least 1 elements with selector "timeline_chart"
    
    When I switch the chart view to "[LANG:dashboard.timeline.volume]"
    And I wait for "chart" to update
    Then the "chart volume" element should visually match the baseline image "dashboard_chart_volume" with a 15.0% tolerance
    
    When I switch the chart view to "[LANG:dashboard.timeline.success]"
    And I wait for "chart" to update
    Then the "chart success" element should visually match the baseline image "dashboard_chart_success" with a 15.0% tolerance

  @visual
  Scenario: Validate Incident and Recent Runs Panels
    Then the following elements should contain these texts
      | element             | value                                |
      | recent_runs_heading | [LANG:dashboard.recent_runs.heading] |
      | incidents_heading   | [LANG:dashboard.incidents.heading]   |
    And the "lists panel" element should visually match the baseline image "dashboard_lists_panels" with a 15.0% tolerance

  @visual
  Scenario: Validate Endpoints Catalog
    When I scroll to the bottom of the page
    Then the "endpoints_heading" element should contain text "[LANG:dashboard.endpoints.heading]"
    And the "endpoints catalog" page should visually match the baseline image "dashboard_bottom_fullpage" with a 15.0% tolerance

  @interactive
  Scenario: Verify Global Actions and Filters
    When I apply the "[LANG:dashboard.filters.seven_days]" time filter
    And I wait for "dashboard" to update
    When I apply the "[LANG:dashboard.filters.thirty_days]" time filter
    And I wait for "dashboard" to update
    When I export the report
    Then the "actions log" element should visually match the baseline image "dashboard_actions_log" with a 15.0% tolerance

  @responsive @mobile
  Scenario: Verify Mobile Viewport Layout
    Then the "header_subtitle" element should contain text "[LANG:dashboard.header.subtitle]"
    And the "mobile layout" page should visually match the baseline image "dashboard_responsiveness" with a 15.0% tolerance

  @navigation
  Scenario: Navigate to Incident Taxonomy
    When I click on the "incidents_link" in the sidebar
    Then the "incidents" page is displayed
    And the following elements should contain these texts
      | element                | value                                  |
      | header_title           | [LANG:incidents.header.title]          |
      | header_subtitle        | [LANG:incidents.header.subtitle]       |
      | filters_scope_dropdown | [LANG:incidents.filters.global_scope] |
    And the "incidents taxonomy" page should visually match the baseline image "incident_taxonomy_page" with a 15.0% tolerance
