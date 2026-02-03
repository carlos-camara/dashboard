@gui @incidents
Feature: Incident Taxonomy View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed
    And I wait for 2 seconds
    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds
    Then the "incidents" page is displayed

  @smoke
  Scenario: Verify Incident Page Structure
    Then the page title should be "[LANG:common.page_title]"
    And the "header_title" should contain the text "[LANG:incidents.header.title]"
    And the "header_subtitle" should contain the text "[LANG:incidents.header.subtitle]"
    And I should see the text "[LANG:incidents.stats.unique]"
    Then I take a screenshot named "incident_page_structure"

  Scenario: Verify Incident Statistics
    Then the "stats_total_sign" should contain the text "[LANG:incidents.stats.total]"
    And the "stats_sectors_sign" should contain the text "[LANG:incidents.stats.sectors]"
    And I should see the text "[LANG:incidents.stats.unique]"
    Then I take a screenshot of the "stats" named "incident_stats_cards"

  Scenario: Verify Project Filtering
    Then the "filters_scope_dropdown" should contain the text "[LANG:incidents.filters.global_scope]"
    When I click on the button with text "[LANG:incidents.filters.global_scope]"
    And I wait for 1 seconds
    Then I take a screenshot named "incident_project_dropdown"
    # Note: Specific project names depend on dynamic data, so we verify the dropdown opens
    And I should see at least 1 elements with class "absolute"

  Scenario: Verify Incident Expansion and Details
    Then I should see at least 1 elements with class "glass-panel"
    When I click on the "list_expand_button"
    And I wait for 1 seconds
    Then the "list_details_context" should contain the text "[LANG:incidents.list.stack_trace]"
    And I should see the text "[LANG:incidents.list.root_cause]"
    And I should see the text "[LANG:incidents.list.affecting]"
    Then I take a screenshot named "incident_expanded_details"
