@api @httpbin @delete
Feature: DELETE method validations for httpbin

  Background:
    Given the API base URL is "https://httpbin.org"

  @smoke
  Scenario: DELETE /delete with JSON body correctly
    When I send a "DELETE" request to "/delete" with JSON body
      """
      { "id": 789, "reason": "cleanup" }
      """
    Then the response status code should be 200
        And the response JSON path "json.id" should be 789
        And the response JSON path "json.reason" should be "cleanup"
        And the response JSON path "url" should contain "https://httpbin.org/delete"

  Scenario: DELETE /delete works without a body
    When I send a "DELETE" request to "/delete"
    Then the response status code should be 200
        And the response JSON path "url" should contain "https://httpbin.org/delete"