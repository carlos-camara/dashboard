@gui @incidents
Feature: Incident Taxonomy View Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And I wait for 2 seconds
    When I click on the "incidents_link" in the sidebar
    And I wait for 1 seconds

  @smoke
  Scenario: Verify Incident Page Structure
    Then the page title should be "QA Hub - Execution Dashboard"
    And I should see the text "INCIDENT"
    And I should see the text "TAXONOMY"
    And I should see the text "Anomaly Detection"
    Then I take a screenshot named "incident_page_structure"

  Scenario: Verify Incident Statistics
    Then I should see the text "Total Incidents"
    And I should see the text "Affected Sectors"
    And I should see the text "Unique Signatures"
    Then I take a screenshot of the "stats" named "incident_stats_cards"

  Scenario: Verify Project Filtering
    Then I should see the text "Global Scope"
    When I click on the button with text "Global Scope"
    And I wait for 1 seconds
    Then I take a screenshot named "incident_project_dropdown"
    # Note: Specific project names depend on dynamic data, so we verify the dropdown opens
    And I should see at least 1 elements with class "absolute"

  Scenario: Verify Incident Expansion and Details
    Then I should see at least 1 elements with class "glass-panel"
    When I click on the element with class "cursor-pointer"
    And I wait for 1 seconds
    Then I should see the text "Stack Trace Context"
    And I should see the text "AI Root Cause Analysis"
    And I should see the text "Affecting Projects"
    Then I take a screenshot named "incident_expanded_details"
