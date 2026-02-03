@gui @dashboard @smoke
Feature: Dashboard View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 2 seconds

  Scenario: Verify Header and Status Ticker
    Then the page title should be "[LANG:common.page_title]"
    And the "subtitle" in "dashboard.header" should contain the text "[LANG:dashboard.header.subtitle]"
    And the system status should be valid
    Then I take a screenshot named "dashboard_header_status"

  Scenario: Verify Statistics Cards
    Then the "passed_card" in "dashboard.stats" should contain the text "[LANG:dashboard.stats.system_health]"
    And the "total_runs" in "dashboard.stats" should contain the text "[LANG:dashboard.stats.total_executions]"
    And the "pass_rate" in "dashboard.stats" should contain the text "[LANG:dashboard.stats.pass_rate]"
    And the "avg_duration" in "dashboard.stats" should contain the text "[LANG:dashboard.stats.avg_latency]"
    Then I take a screenshot of the "stats grid" named "dashboard_stats_grid"

  Scenario: Verify Timeline Controls
    Then the "heading" in "dashboard.timeline" should contain the text "[LANG:dashboard.timeline.heading]"
    And I should see at least 1 elements with selector "chart" in "dashboard.timeline"
    When I switch the chart view to "[LANG:dashboard.timeline.volume]"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_volume"
    When I switch the chart view to "[LANG:dashboard.timeline.success]"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_success"

  Scenario: Verify Incident and Sector Lists
    Then the "heading" in "dashboard.recent_runs" should contain the text "[LANG:dashboard.recent_runs.heading]"
    And I should see at least 1 elements with class "bg-slate-950/40"
    Then the "heading" in "dashboard.incidents" should contain the text "[LANG:dashboard.incidents.heading]"
    Then I take a screenshot of the "lists panel" named "dashboard_lists_panels"

  Scenario: Verify Endpoints Catalog and Scroll
    When I scroll to the bottom of the page
    Then the "heading" in "dashboard.endpoints" should contain the text "[LANG:dashboard.endpoints.heading]"
    Then I take a screenshot named "dashboard_bottom_fullpage"

  Scenario: Verify Global Actions and Filters
    When I apply the "[LANG:dashboard.filters.seven_days]" time filter
    And I wait for 1 seconds
    When I apply the "[LANG:dashboard.filters.thirty_days]" time filter
    And I wait for 1 seconds
    When I export the report
    And I wait for 1 seconds
    Then I take a screenshot named "dashboard_actions_log"

  @responsive @mobile
  Scenario: Verify Mobile Viewport Layout
    Then the "subtitle" in "dashboard.header" should contain the text "[LANG:dashboard.header.subtitle]"
    Then I take a screenshot named "dashboard_responsiveness"

  Scenario: Verify Navigation to Incident Taxonomy
    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds
    Then the "title" in "incidents.header" should contain the text "[LANG:incidents.header.title]"
    And the "subtitle" in "incidents.header" should contain the text "[LANG:incidents.header.subtitle]"
    And the "scope_dropdown" in "incidents.filters" should contain the text "[LANG:incidents.filters.global_scope]"
    Then I take a screenshot named "incident_taxonomy_page"
