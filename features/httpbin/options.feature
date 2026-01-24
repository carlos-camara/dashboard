@api @httpbin @options
Feature: OPTIONS method validations for httpbin

  Background:
    Given the API base URL is "https://httpbin.org"

  @smoke
  Scenario: OPTIONS /anything returns JSON indicating method and url
    When I send a "OPTIONS" request to "/get"
    Then the response status code should be 200
        And the response should be empty

  Scenario: OPTIONS /anything echoes custom headers
    When I set request headers
         | header       | Value |
         | X-Preflight  | test  |
        And I send a "OPTIONS" request to "/get"
    Then the response status code should be 200
        And the response should be empty
