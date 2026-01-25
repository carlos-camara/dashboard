@api @sendgrid @batch @contract @performance
Feature: SendGrid Mail Batch - Contract & Performance

  Background:
    Given the API base URL is "https://sendgrid-v3-api.mock.beeceptor.com"
    When I set request headers
      | header       | Value    |
      | on-behalf-of | Ut minim |

  Scenario: Response contract is stable and response time is acceptable
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And the response JSON should contain keys
      | batch_id |
    And the response time should be less than 2000 ms