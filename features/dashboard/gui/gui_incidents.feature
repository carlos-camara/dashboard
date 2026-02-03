@gui @incidents
Feature: Incident Taxonomy View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 2 seconds
    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds

  @smoke
  Scenario: Verify Incident Page Structure
    Then the page title should be "i18n:common.page_title"
    And the "title" in "incidents.header" should contain the text "i18n:incidents.header.title"
    And the "subtitle" in "incidents.header" should contain the text "i18n:incidents.header.subtitle"
    And I should see the text "i18n:incidents.stats.unique"
    Then I take a screenshot named "incident_page_structure"

  Scenario: Verify Incident Statistics
    Then the "total_sign" in "incidents.stats" should contain the text "i18n:incidents.stats.total"
    And the "sectors_sign" in "incidents.stats" should contain the text "i18n:incidents.stats.sectors"
    And I should see the text "i18n:incidents.stats.unique"
    Then I take a screenshot of the "stats" named "incident_stats_cards"

  Scenario: Verify Project Filtering
    Then the "scope_dropdown" in "incidents.filters" should contain the text "i18n:incidents.filters.global_scope"
    When I click on the button with text "i18n:incidents.filters.global_scope"
    And I wait for 1 seconds
    Then I take a screenshot named "incident_project_dropdown"
    # Note: Specific project names depend on dynamic data, so we verify the dropdown opens
    And I should see at least 1 elements with class "absolute"

  Scenario: Verify Incident Expansion and Details
    Then I should see at least 1 elements with class "glass-panel"
    When I click on the element with class "cursor-pointer"
    And I wait for 1 seconds
    Then the "details_context" in "incidents.list" should contain the text "i18n:incidents.list.stack_trace"
    And I should see the text "i18n:incidents.list.root_cause"
    And I should see the text "i18n:incidents.list.affecting"
    Then I take a screenshot named "incident_expanded_details"
