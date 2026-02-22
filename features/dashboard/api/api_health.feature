@CC-452 @api @dashboard @health
Feature: System Health Monitoring
  
  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @critical
  Scenario: Verify System Health Check
    When I send a "GET" request to "/api/health"
    Then the response status code should be 200
    And the response header "Content-Type" should contain "application/json"
    And the response time should be less than 200 ms
    And the response JSON path "status" should equal "ok"
    # Additional robust check
    And the response JSON path "timestamp" should be a "str"

  @negative @security
  Scenario: Verify Method Not Allowed (POST)
    When I send a "POST" request to "/api/health"
    Then the response status code should be 404

  @negative @security
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/health"
    Then the response status code should be 404

  @negative @security
  Scenario: Verify Method Not Allowed (DELETE)
    When I send a "DELETE" request to "/api/health"
    Then the response status code should be 404
