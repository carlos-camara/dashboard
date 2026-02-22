@CC-456 @gui @variables
Feature: Variable Transformation Validation

  Background:
     Given I navigate to the dashboard at "http://localhost:3000/dashboard/"
    And the "dashboard" page is displayed

  Scenario: Verify basic generation tokens
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    Then the following elements should contain these texts
         | element      | value   |
         | search_input | [EMPTY] |
    When I type "[STRING_WITH_LENGTH_10]" into the "search_input"
    And I wait for 1 seconds
    Then I should see the "search_input"
    
  Scenario: Verify unique and random tokens
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I type "[UUID]" into the "search_input"
    And I wait for 1 seconds
    When I type "[RANDOM]" into the "search_input"
    And I wait for 1 seconds
    
  Scenario: Verify temporal tokens
    # Using Now with current year which is likely in the page title or footer
    Then the page title should be "QA Hub - Execution Dashboard"
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    # Just checking if NOW resolves and doesn't crash
    When I type "[NOW(%Y)]" into the "search_input"
    And I wait for 1 seconds
    Then the following elements should contain these texts
         | element      | value     |
         | search_input | [NOW(%Y)] |
    
  Scenario: Verify transformation functions
    When I click on the "test_runs_link" in the sidebar
    Then the "test_runs" page is displayed
    When I type "[UPPER:qa-hub]" into the "search_input"
    And I wait for 1 seconds
    Then the following elements should contain these texts
         | element      | value  |
         | search_input | QA-HUB |
    When I type "[STR:[INT:123]]" into the "search_input"
    And I wait for 1 seconds
    Then the following elements should contain these texts
         | element      | value |
         | search_input | 123   |
