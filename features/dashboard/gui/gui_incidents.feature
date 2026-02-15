@gui @incidents
Feature: Incident Taxonomy & Analysis

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    When I click on the "incidents_link" in the sidebar
    Then the "incidents" page is displayed
    And I wait for "incidents" to be stable
    And I wait for 5 seconds

  @visual @smoke
  Scenario: Verify Incident Page Structure
    Then the page title should be "[LANG:common.page_title]"
    And the following elements should contain these texts
        | element         | value                            |
        | header_title    | [LANG:incidents.header.title]    |
        | header_subtitle | [LANG:incidents.header.subtitle] |
    Then the "incident page structure" page should visually match the baseline image "incident_page_structure" without elements and with a 15.0% tolerance
      | element                 |
      | stats_total_value       |
      | stats_sectors_value     |
      | stats_unique_value      |
      | list_incident_timestamp |
      | list_incident_message   |
      | list_incident_frequency |
      | list_incident_trend     |
      | incident_list_container |

  Scenario: Verify Incident Statistics
    Then the following elements should contain these texts
         | element            | value                          |
         | stats_total_sign   | [LANG:incidents.stats.total]   |
         | stats_sectors_sign | [LANG:incidents.stats.sectors] |
    And I should see the text "[LANG:incidents.stats.unique]"

  @interactive
  Scenario: Verify Project Filtering
    Then the "filters_scope_dropdown" should contain the text "[LANG:incidents.filters.global_scope]"
    When I click on the button with text "[LANG:incidents.filters.global_scope]"
    And I wait for "dropdown" to update
    Then I should see at least 1 elements with class "absolute"

  @interactive
  Scenario: Verify Incident Expansion and Details
    Then I should see at least 1 elements with class "glass-panel"
    When I click on the "list_incident_summary"
    And I wait for 2 seconds
    Then the "incident_expanded" should be visible
    Then the "list_details_context" should contain the text "[LANG:incidents.list.stack_trace]"
    And I should see the text "[LANG:incidents.list.root_cause]"
    And I should see the text "[LANG:incidents.list.affecting]"
