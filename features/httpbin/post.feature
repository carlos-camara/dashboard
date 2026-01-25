@api @httpbin @post
Feature: POST method validations for httpbin

  Background:
    Given the API base URL is "https://httpbin.org"

  @smoke
  Scenario: POST /post with JSON body correctly
    When I send a "POST" request to "/post" with JSON body
      """
      {
        "id": 123,
        "name": "api-qa",
        "active": true,
        "flags": [
          "smoke",
          "regression"
        ]
      }
      """
    Then the response status code should be 200
    And the response time should be less than 2500 ms
    And the response JSON should contain keys
      | args    |
      | data    |
      | files   |
      | form    |
      | headers |
      | json    |
      | origin  |
      | url     |
    And the response JSON path "json.id" should be 123
    And the response JSON path "json.name" should be "api-qa"
    And the response JSON path "json.active" should be true
    And the response JSON path "url" should contain "https://httpbin.org/post"

  Scenario: POST /post with form fields
    When I send a "POST" request to "/post" with form data
      | username | john |
      | plan     | pro  |
    Then the response status code should be 200
    And the response JSON path "form.username" should be "john"
    And the response JSON path "form.plan" should be "pro"
    And the response JSON path "json" should be null

  Scenario: POST /post with custom header and JSON
    When I set request headers
      | header       | Value  |
      | X-Request-Id | 9f3a2c |
    And I send a "POST" request to "/post" with JSON body
      """
      {
        "requestId": "9f3a2c",
        "type": "integration"
      }
      """
    Then the response status code should be 200
    And the response JSON path "json.requestId" should be "9f3a2c"
    And the response JSON path "json.type" should be "integration"