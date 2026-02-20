@gui @dashboard
Feature: Dashboard Overview & Visual Integrity

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for "dashboard" to be stable

  @visual @smoke
  @CC-440
  Scenario: Validate Header and System Status
    Then the page title should be "[LANG:common.page_title]"
    And the "header_subtitle" element should contain text "[LANG:dashboard.header.subtitle]"
    And the "status_ticker_system_status" text should be one of "SYSTEM OPTIMAL, ALL SYSTEMS OPERATIONAL, PARTIAL SERVICE DEGRADATION, MINOR ANOMALIES DETECTED, CRITICAL INSTABILITY DETECTED, CONNECTION SEVERED"
    And I wait for "2" seconds
    Then the "dashboard" page should visually match the baseline image "dashboard_full_view_masked" without elements and with a 15.0% tolerance
        | element                     |
        | status_ticker_system_status |
        | status_ticker_container     |
        | recent_runs_list_container  |
        | stats_health_value          |
        | stats_total_runs_value      |
        | stats_pass_rate_value       |
        | stats_avg_duration_value    |

  @visual @critical @smoke
  @CC-441
  Scenario: Validate Statistics Key Metrics
    Then the following elements should contain these texts
         | element             | value                                     |
         | stats_passed_card   | [LANG:dashboard.stats.system_health]      |
         | stats_total_runs    | [LANG:dashboard.stats.total_executions]   |
         | stats_pass_rate     | [LANG:dashboard.stats.pass_rate]          |
         | stats_avg_duration  | [LANG:dashboard.stats.avg_latency]        |
    And the "stats_grid" element should visually match the baseline image "dashboard_stats_grid_masked" without elements and with a 15.0% tolerance
        | element                  |
        | stats_health_value       |
        | stats_pass_rate_value    |
        | stats_total_runs_value   |
        | stats_avg_duration_value |

  @CC-278
  Scenario: Validate Recent Runs Panel
    Then the following elements should contain these texts
      | element             | value                                |
      | recent_runs_heading | [LANG:dashboard.recent_runs.heading] |

  @responsive @mobile
  @CC-442
  Scenario: Verify Mobile Viewport Layout
    Given I set the viewport to "375" x "812"
    Then the "header_subtitle" element should contain text "[LANG:dashboard.header.subtitle]"
    And the "mobile_layout" page should visually match the baseline image "dashboard_responsiveness" without elements and with a 15.0% tolerance
        | element                  |
        | stats_health_value       |
        | stats_pass_rate_value    |
        | stats_total_runs_value   |
        | stats_avg_duration_value |
        | status_ticker_container  |
        | timeline_chart           |


