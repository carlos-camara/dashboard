@api @dashboard @endpoints
Feature: System Endpoints Discovery
  As a QA Engineer
  I want to verify that the dashboard correctly lists available API endpoints
  So that I can ensure the monitoring system is functioning and self-aware.

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @critical
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
  Scenario: Verify Method Not Allowed (POST)
    When I send a "POST" request to "/api/endpoints"
    Then the response status code should be 404

  @negative @security
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/endpoints"
    Then the response status code should be 404

  @negative @security
  Scenario: Verify Method Not Allowed (PATCH)
    When I send a "PATCH" request to "/api/endpoints"
    Then the response status code should be 404
