@api @dashboard
Feature: Dashboard API Validations
  As a QA Engineer
  I want to verify the dashboard server APIs
  So that I can ensure test results are correctly processed and displayed

  Background:
    Given the API base URL is "http://localhost:3001"

  @smoke @health
  Scenario: Health check returns 200 OK
    When I send a "GET" request to "/api/health"
    Then the response status code should be 200
    And the response JSON path "status" should be "ok"
    And the response JSON should contain keys
      | timestamp |

  @smoke @runs @upload
  Scenario: Uploading a valid JUnit XML report
    When I upload the file "test_run_sample.xml" to "/api/upload"
    Then the response status code should be 200
    And the response JSON path "success" should be true
    And the response JSON path "totalCount" should be 1
    And I store the response JSON path "runId" as "uploaded_run_id"

  @smoke @runs @retrieval
  Scenario: Retrieve Runs and Verify Uploaded Run
    When I send a "GET" request to "/api/runs"
    Then the response status code should be 200
    And the response JSON path "0.id" should equal stored variable "uploaded_run_id"
    And the response JSON path "0.totalCount" should be 1

  @smoke @runs @scenarios
  Scenario: Retrieve Scenarios for a specific Run
    # Depends on the run ID stored in the upload step. 
    # Note: In a real independent run, we might want to upload fresh data properly or rely on state.
    # For this flow, we assume sequential execution or existing state.
    # But to be safe in BDD, let's just get the first run ID available if we can't rely on state persistence across scenarios easily without a runner ensuring it.
    
    When I send a "GET" request to "/api/runs"
    Then the response status code should be 200
    And I store the response JSON path "0.id" as "latest_run_id"
    
    When I send a "GET" request to "/api/runs/${latest_run_id}/scenarios"
    Then the response status code should be 200
    And the response JSON should not be empty
    And the response JSON path "0.name" should be a "str"

  @smoke@endpoints @discovery
  Scenario: Retrieve Discovered Endpoints
    When I send a "GET" request to "/api/endpoints"
    Then the response status code should be 200
    And the response JSON should not be empty

  @smoke @sync
  Scenario: Trigger Sync scans reports directory
    When I send a "POST" request to "/api/sync"
    Then the response status code should be 200
    And the response JSON should contain keys
      | new_runs_discovered |
      | scanned_path        |

  @smoke @cleanup
  Scenario: Delete the uploaded run
    When I send a "GET" request to "/api/runs"
    And I store the response JSON path "0.id" as "run_to_delete"
    
    When I send a "DELETE" request to "/api/runs" with query parameters
      | id | ${run_to_delete} |
    Then the response status code should be 200
    And the response JSON path "success" should be true
