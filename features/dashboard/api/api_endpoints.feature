@api @dashboard @endpoints
Feature: Endpoints Discovery Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke
  Scenario: Retrieve Discovered Endpoints
    When I send a "GET" request to "/api/endpoints"
    Then the response status code should be 200
    And the response header "Content-Type" should contain "application/json"
    And the response time should be less than 1000 ms
    And the response JSON should not be empty
    And the response JSON path "0.id" should be a "str"
    And the response JSON path "0.method" should be a "str"
    And the response JSON path "0.path" should be a "str"
    And the response JSON path "0.service" should be a "str"
    And the response JSON path "0.passCount" should be a "int"
    And the response JSON path "0.failCount" should be a "int"

  @smoke @negative
  Scenario: Verify Method Not Allowed (POST)
    When I send a "POST" request to "/api/endpoints"
    Then the response status code should be 404

  @negative
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/endpoints"
    Then the response status code should be 404

  @negative
  Scenario: Verify Method Not Allowed (PATCH)
    When I send a "PATCH" request to "/api/endpoints"
    Then the response status code should be 404
