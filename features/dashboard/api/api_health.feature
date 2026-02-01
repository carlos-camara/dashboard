@api @dashboard @health
Feature: Health Endpoint Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke
  Scenario: Health check returns 200 OK
    When I send a "GET" request to "/api/health"
    Then the response status code should be 200
    And the response JSON path "status" should be "ok"
    And the response header "Content-Type" should contain "application/json"
    And the response time should be less than 500 ms

  @smoke @negative
  Scenario: METHOD NOT ALLOWED (POST)
    When I send a "POST" request to "/api/health"
    Then the response status code should be 404

  @negative
  Scenario: METHOD NOT ALLOWED (PUT)
    When I send a "PUT" request to "/api/health"
    Then the response status code should be 404

  @negative
  Scenario: METHOD NOT ALLOWED (DELETE)
    When I send a "DELETE" request to "/api/health"
    Then the response status code should be 404
