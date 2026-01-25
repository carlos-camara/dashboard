@api @httpbin @get
Feature: GET method validations for httpbin

  Background:
    Given the API base URL is "https://httpbin.org"

  @smoke
  Scenario: GET /get returns 200 with query parameters
    When I send a "GET" request to "/get" with query parameters
      | header | Value |
      | foo    | bar   |
      | n      | 1     |
    Then the response status code should be 200
    And the response time should be less than 2000 ms
    And the response JSON should contain keys
      | args    |
      | headers |
      | origin  |
      | url     |
    And the response JSON path "args" should equal JSON
      """
      {
        "foo": "bar",
        "n": "1"
      }
      """
    And the response JSON path "headers.Host" should be "httpbin.org"
    And the response JSON path "url" should contain "https://httpbin.org/get"

  Scenario: GET /get with custom headers
    When I set request headers
      | header       | Value        |
      | X-QA-Trace   | behave-suite |
      | X-Client-App | qa-dashboard |
    And I send a "GET" request to "/get"
    Then the response status code should be 200
    And the response JSON path "headers.X-Qa-Trace" should be "behave-suite"
    And the response JSON path "headers.X-Client-App" should be "qa-dashboard"

  Scenario: GET /get contract - args is a dict and url is a string
    When I send a "GET" request to "/get" with query parameters
      | header | Value |
      | a      | 10    |
    Then the response status code should be 200
    And the response JSON path "args" should be a "dict"
    And the response JSON path "url" should be a "str"