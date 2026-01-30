@api @dashboard @health
Feature: Health Endpoint Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @health
  Scenario: Health check returns 200 OK
    When I send a "GET" request to "/api/health"
    Then the response status code should be 200
    And the response JSON path "status" should be "ok"
    And the response JSON should contain keys
      | timestamp |
