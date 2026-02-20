@gui @navigation
Feature: Application Navigation Validation

  Background:
    Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  @smoke
  @CC-201
  Scenario: Navigate to all main sections
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the "title" should contain the text "[LANG:navigation.test_runs]"
    When I click on the "endpoints_link" in the sidebar
    Then the "endpoints_view" page is displayed
    Then the "title" should contain the text "[LANG:navigation.endpoints]"

    When I click on the "dashboard_link" in the sidebar
    Then the "dashboard" page is displayed
    Then the following elements should contain these texts
         | element         | value                            |
         | header_subtitle | [LANG:dashboard.header.subtitle] |

  @visual
  @CC-202
  Scenario: Sidebar navigation persistence
    When I click on the "test_runs_link" in the sidebar
    When I click on the "dashboard_link" in the sidebar
    Then the "dashboard" page is displayed
    Then the following elements should contain these texts
         | element         | value                            |
         | header_subtitle | [LANG:dashboard.header.subtitle] |
    Then the "sidebar.sidebar_container" element should visually match the baseline image "nav_sidebar_persistence" with a 5.0% tolerance
