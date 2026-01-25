@api @sendgrid @scheduled_sends @contract @performance
Feature: SendGrid Scheduled Sends - Contract & Performance

  Background:
    Given the API base URL is "https://sendgrid-v3-api.mock.beeceptor.com"
    When I set request headers
      | header       | Value    |
      | on-behalf-of | Ut minim |

  Scenario: Pause response contract and timing
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And I store the response JSON path "batch_id" as "batch_id"
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body using variables:
      """
      {
        "batch_id": "${batch_id}",
        "status": "pause"
      }
      """
    Then the response status code should be 201
    And the response JSON path "batch_id" should equal stored variable "batch_id"
    And the response JSON path "status" should be "pause"
    And the response time should be less than 2000 ms