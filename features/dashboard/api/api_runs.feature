@api @dashboard @runs
Feature: Runs Endpoint Validations

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke
  @CC-185
  Scenario: Upload, Verify, and Explore a Run
    # 1. Upload
    When I upload the file "test_run_sample.xml" to "/api/upload"
    Then the response status code should be 200
    And the response JSON path "success" should be true
    And the response JSON path "totalCount" should be 1
    And I store the response JSON path "runId" as "uploaded_run_id"

    # 2. Verify in list
    When I send a "GET" request to "/api/runs"
    Then the response status code should be 200
    And the response JSON path "0.id" should equal stored variable "uploaded_run_id"
    And the response JSON path "0.totalCount" should be 1
    
    # 3. Explore scenarios
    When I send a "GET" request to "/api/runs/${uploaded_run_id}/scenarios"
    Then the response status code should be 200
    And the response JSON should not be empty
    And the response JSON path "0.name" should be a "str"

  @CC-186
  Scenario: Delete the uploaded run
    When I send a "GET" request to "/api/runs"
    Then I store the response JSON path "0.id" as "run_to_delete"
    When I send a "DELETE" request to "/api/runs" with query parameters
         | id | ${run_to_delete} |
    Then the response status code should be 200
    Then the response JSON path "success" should be true

  @smoke @negative
  @CC-187
  Scenario: Get non-existent run
    When I send a "GET" request to "/api/runs/INVALID_RUN_ID"
    Then the response status code should be 404

  @negative
  @CC-188
  Scenario: Verify Method Not Allowed (PUT)
    When I send a "PUT" request to "/api/runs"
    Then the response status code should be 404

  @negative
  @CC-189
  Scenario: Verify Method Not Allowed (PATCH)
    When I send a "PATCH" request to "/api/runs"
    Then the response status code should be 404
