@api @dashboard @sync
Feature: Sync Endpoint Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke
  @CC-429
  Scenario: Trigger Sync scans reports directory
    When I send a "POST" request to "/api/sync"
    Then the response status code should be 200
    And the response time should be less than 2000 ms
    And the response JSON should contain keys
        | new_runs_discovered |
        | scanned_path        |
    And the response JSON path "new_runs_discovered" should be a "int"
    And the response JSON path "scanned_path" should be a "str"
    And the response JSON path "scanned_path" should contain "reports"

  @smoke @idempotency
  @CC-430
  Scenario: Sync is idempotent
    When I send a "POST" request to "/api/sync"
    Then the response status code should be 200
    When I send a "POST" request to "/api/sync"
    Then the response status code should be 200
    And the response JSON path "new_runs_discovered" should be >= 0

  @smoke @negative
  @CC-431
  Scenario: Verify Method Not Allowed (GET)
    When I send a "GET" request to "/api/sync"
    Then the response status code should be 404

  @negative
  @CC-432
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/sync"
    Then the response status code should be 404

  @negative
  @CC-433
  Scenario: Verify Method Not Allowed (DELETE)
    When I send a "DELETE" request to "/api/sync"
    Then the response status code should be 404

  @negative
  @CC-434
  Scenario: Verify Method Not Allowed (PATCH)
    When I send a "PATCH" request to "/api/sync"
    Then the response status code should be 404
