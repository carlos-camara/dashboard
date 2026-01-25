@api @sendgrid @scheduled_sends @negative
Feature: SendGrid Scheduled Sends - Validation Errors (Negative)

  Background:
    Given the API base URL is "https://sendgrid-v3-api.mock.beeceptor.com"
    When I set request headers
      | header       | Value    |
      | on-behalf-of | Ut minim |

  @smoke
  Scenario: Missing batch_id should return 400
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body
      """
      { "status": "pause" }
      """
    Then the response status code should be 400

  Scenario: Missing status should return 400
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body
      """
      { "batch_id": "dummy" }
      """
    Then the response status code should be 400

  Scenario: Invalid status value should return 400
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body
      """
      { "batch_id": "dummy", "status": "paused" }
      """
    Then the response status code should be 400

  Scenario: Empty batch_id should return 400
    When I send a "POST" request to "/v3/user/scheduled_sends" with JSON body
      """
      { "batch_id": "", "status": "pause" }
      """
    Then the response status code should be 400
