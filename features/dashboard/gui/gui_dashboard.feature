@gui @dashboard @smoke
Feature: Dashboard View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    When I wait for 2 seconds

  Scenario: Verify Header and Status Ticker
    Then the page title should be "QA Hub - Execution Dashboard"
    And the "subtitle" in "dashboard.header" should contain the text "Dashboard Cluster"
    And the system status should be valid
    Then I take a screenshot named "dashboard_header_status"

  Scenario: Verify Statistics Cards
    Then the "passed_card" in "dashboard.stats" should contain the text "System Health"
    And the "total_runs" in "dashboard.stats" should contain the text "Total Executions"
    And the "pass_rate" in "dashboard.stats" should contain the text "Pass Rate"
    And the "avg_duration" in "dashboard.stats" should contain the text "Avg Latency"
    Then I take a screenshot of the "stats grid" named "dashboard_stats_grid"

  Scenario: Verify Timeline Controls
    Then the "heading" in "dashboard.timeline" should contain the text "Signal Velocity"
    And I should see at least 1 elements with selector "chart" in "dashboard.timeline"
    When I switch the chart view to "Volume"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_volume"
    When I switch the chart view to "Success"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_success"

  Scenario: Verify Incident and Sector Lists
    Then the "heading" in "dashboard.recent_runs" should contain the text "Sector Integrity"
    And I should see at least 1 elements with class "bg-slate-950/40"
    Then the "heading" in "dashboard.incidents" should contain the text "Incident Taxonomy"
    Then I take a screenshot of the "lists panel" named "dashboard_lists_panels"

  Scenario: Verify Endpoints Catalog and Scroll
    When I scroll to the bottom of the page
    Then the "heading" in "dashboard.endpoints" should contain the text "Latency Anomalies"
    Then I take a screenshot named "dashboard_bottom_fullpage"

  Scenario: Verify Global Actions and Filters
    When I apply the "7 Days" time filter
    And I wait for 1 seconds
    When I apply the "30 Days" time filter
    And I wait for 1 seconds
    When I export the report
    And I wait for 1 seconds
    Then I take a screenshot named "dashboard_actions_log"

  @responsive @mobile
  Scenario: Verify Mobile Viewport Layout
    Then the "subtitle" in "dashboard.header" should contain the text "Dashboard Cluster"
    Then I take a screenshot named "dashboard_responsiveness"

  Scenario: Verify Navigation to Incident Taxonomy
    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds
    Then the "title" in "incidents.header" should contain the text "INCIDENT"
    And the "subtitle" in "incidents.header" should contain the text "TAXONOMY"
    And the "scope_dropdown" in "incidents.filters" should contain the text "Global Scope"
    Then I take a screenshot named "incident_taxonomy_page"
