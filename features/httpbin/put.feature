@api @httpbin @put
Feature: PUT method validations for httpbin

  Background:
    Given the API base URL is "https://httpbin.org"

  @smoke
  Scenario: PUT /put with JSON body correctly
    When I send a "PUT" request to "/put" with JSON body:
      """
      { "id": 456, "status": "updated" }
      """
    Then the response status code should be 200
        And the response JSON path "json.id" should be 456
        And the response JSON path "json.status" should be "updated"
        And the response JSON path "url" should contain "https://httpbin.org/put"
  
  Scenario: PUT /put with custom headers
    When I set request headers
         | header | Value  |
         | X-Env  | QA     |      
        And I send a "PUT" request to "/put" with JSON body
            """
            { "hello": "world" }
            """
    Then the response status code should be 200
        And the response JSON path "json.hello" should be "world"