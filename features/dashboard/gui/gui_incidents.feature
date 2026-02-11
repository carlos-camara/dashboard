@gui @incidents @smoke
Feature: Incident Taxonomy & Analysis
  As a Reliability Engineer
  I want to review system incidents and stack traces
  So that I can identify root causes and improve system stability.

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    When I click on the "incidents_link" in the sidebar
    Then the "incidents" page is displayed
    And I wait for "incidents" to be stable

  @visual
  Scenario: Verify Incident Page Structure
    Then the page title should be "[LANG:common.page_title]"
    And the following elements should contain these texts
      | element         | value                            |
      | header_title    | [LANG:incidents.header.title]    |
      | header_subtitle | [LANG:incidents.header.subtitle] |
    
    And I should see the text "[LANG:incidents.stats.unique]"
    Then the "incident page structure" page should visually match the baseline image "incident_page_structure" with a 5.0% tolerance

  @visual
  Scenario: Verify Incident Statistics
    Then the following elements should contain these texts
      | element            | value                         |
      | stats_total_sign   | [LANG:incidents.stats.total]   |
      | stats_sectors_sign | [LANG:incidents.stats.sectors] |
    And I should see the text "[LANG:incidents.stats.unique]"
    Then the "incident stats" element should visually match the baseline image "incident_stats_cards" with a 5.0% tolerance

  @interactive
  Scenario: Verify Project Filtering
    Then the "filters_scope_dropdown" should contain the text "[LANG:incidents.filters.global_scope]"
    When I click on the button with text "[LANG:incidents.filters.global_scope]"
    And I wait for "dropdown" to update
    Then the "project dropdown" element should visually match the baseline image "incident_project_dropdown" with a 8.0% tolerance
    And I should see at least 1 elements with class "absolute"

  @interactive @visual
  Scenario: Verify Incident Expansion and Details
    Then I should see at least 1 elements with class "glass-panel"
    When I click on the "list_expand_button"
    And I wait for "details" to update
    
    Then the "list_details_context" should contain the text "[LANG:incidents.list.stack_trace]"
    And I should see the text "[LANG:incidents.list.root_cause]"
    And I should see the text "[LANG:incidents.list.affecting]"
    
    Then the "incident expanded" element should visually match the baseline image "incident_expanded_details" with a 5.0% tolerance
