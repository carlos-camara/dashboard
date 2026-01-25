@api @sendgrid @batch @happy @smoke
Feature: SendGrid Mail Batch - Create Batch ID (Happy Path)

  Background:
    Given the API base URL is "https://sendgrid-v3-api.mock.beeceptor.com"
    When I set request headers
      | header       | Value    |
      | on-behalf-of | Ut minim |

  Scenario: POST /v3/mail/batch returns 201 and a valid batch_id
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And the response JSON should not be empty
    And the response JSON should contain keys
      | batch_id |
    And the response JSON path "batch_id" should be a "str"

  Scenario: POST /v3/mail/batch returns different batch_id on subsequent calls
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And I store the response JSON path "batch_id" as "batch_id_1"
    When I send a "POST" request to "/v3/mail/batch"
    Then the response status code should be 201
    And I store the response JSON path "batch_id" as "batch_id_2"
    Then the stored variables "batch_id_1" and "batch_id_2" should be different