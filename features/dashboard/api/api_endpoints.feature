@api @dashboard @endpoints
Feature: System Endpoints Discovery

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @critical
  @CC-421
  Scenario: Retrieve System Endpoints List
    When I send a "GET" request to "/api/endpoints"
    Then the response status code should be 200
    And the response header "Content-Type" should contain "application/json"
    And the response time should be less than 500 ms
    And the response JSON should not be empty
    # Validation of structure and self-discovery
    And the response JSON path "0.id" should be a "str"
    And the response JSON path "0.method" should be a "str"
    And the response JSON path "0.path" should be a "str"
    And the response JSON path "0.service" should be a "str"
    # Verify we seeded the system service
    And the response JSON path "0.service" should equal "dashboard-system"

  @negative @security
  @CC-422
  Scenario: Verify Method Not Allowed (POST)
    When I send a "POST" request to "/api/endpoints"
    Then the response status code should be 404

  @negative @security
  @CC-423
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/endpoints"
    Then the response status code should be 404

  @negative @security
  @CC-424
  Scenario: Verify Method Not Allowed (PATCH)
    When I send a "PATCH" request to "/api/endpoints"
    Then the response status code should be 404
