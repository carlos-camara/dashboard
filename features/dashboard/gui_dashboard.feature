@gui @dashboard @smoke
Feature: Dashboard View Validation
  As a QA Engineer
  I want to verify the visual components of the main Dashboard
  So that I can ensure the "Ultra Premium" experience is delivered correctly

  Background:
    Given I navigate to the dashboard at "http://localhost:3000"
    When I wait for 2 seconds

  @structure @header
  Scenario: Verify Header and Status Ticker
    Then the page title should be "QA Hub - Execution Dashboard"
    And I should see the text "Dashboard Cluster"
    And the system status should be valid
    Then I take a screenshot named "dashboard_header_status"

  @components @stats
  Scenario: Verify Statistics Cards
    Then I should see the text "System Health"
    And I should see the text "Total Executions"
    And I should see the text "Pass Rate"
    And I should see the text "Avg Latency"
    Then I take a screenshot of the "stats grid" named "dashboard_stats_grid"

  @components @charts
  Scenario: Verify Timeline Controls
    Then I should see the text "Signal Velocity"
    When I switch the chart view to "Volume"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_volume"
    When I switch the chart view to "Success"
    And I wait for 1 seconds
    Then I take a screenshot of the "chart" named "dashboard_chart_success"

  @components @lists
  Scenario: Verify Incident and Sector Lists
    Then I should see the text "Sector Integrity"
    And I should see at least 1 elements with class "bg-slate-950/40"
    Then I should see the text "Incident Taxonomy"
    Then I take a screenshot of the "lists panel" named "dashboard_lists_panels"

  @components @endpoints_scroll
  Scenario: Verify Endpoints Catalog and Scroll
    When I scroll to the bottom of the page
    Then I should see the text "Latency Anomalies"
    Then I take a screenshot named "dashboard_bottom_fullpage"

  @actions @filters
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
    Then I should see the text "Dashboard Cluster"
    Then I take a screenshot named "dashboard_responsiveness"
