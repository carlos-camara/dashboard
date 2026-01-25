@api @sendgrid @scheduled_sends @happy @smoke
Feature: SendGrid Scheduled Sends - Pause/Cancel (Happy Path)

  Background:
    Given the API base URL is "https://sendgrid-v3-api.mock.beeceptor.com"
    When I set request headers
      | header       | Value    |
      | on-behalf-of | Ut minim |

  # This scenario creates a batch_id first, then pauses it.
  Scenario: Pause a scheduled send by batch_id
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
    And the response JSON should contain keys
      | batch_id |
      | status   |
      | batch_id |
    And the response JSON path "batch_id" should equal stored variable "batch_id"
    And the response JSON path "status" should be "pause"

  # This scenario creates a batch_id first, then cancels it.
  Scenario: Cancel a scheduled send by batch_id
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And I store the response JSON path "batch_id" as "batch_id"
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body using variables:
      """
      {
        "batch_id": "${batch_id}",
        "status": "cancel"
      }
      """
    Then the response status code should be 201
    And the response JSON should contain keys
      | batch_id |
      | status   |
      | batch_id |
    And the response JSON path "batch_id" should equal stored variable "batch_id"
    And the response JSON path "status" should be "cancel"