@api @dashboard @endpoints
Feature: Endpoints Discovery Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @endpoints @discovery
  Scenario: Retrieve Discovered Endpoints
    When I send a "GET" request to "/api/endpoints"
    Then the response status code should be 200
    And the response JSON should not be empty
