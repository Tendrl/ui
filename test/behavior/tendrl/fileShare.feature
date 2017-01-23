Feature: File Share

  Scenario: List view is available
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    Then  I should see the "file-share" data

  Scenario: Search the Files by Name
    Given I open the Tendrl url
    When  I click on "" in side nav
    And   I type the "name" of the file-share available
    Then  I should see the file-share in List View
  
  Scenario: Search the Files by Cluster
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I select "cluster" from the dropdown
    And   I type the "cluster" of the file-share available
    Then  I should see the file-share in List View

  Scenario: Search the Files by Type
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I select "type" from the dropdown
    And   I type the "type" of the file-share available
    Then  I should see the file-share in List View

  Scenario: Search the Files by Status
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I select "status" from the dropdown
    And   I type the "status" of the file-share available
    Then  I should see the file-share in List View

  Scenario: Sort the Files by Cluster
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I should select "cluster" from the dropdown
    Then  I should see the List view sorted on basis of "cluster"

  Scenario: Sort the Files by Storage
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I should select "storage" from the dropdown
    Then  I should see the List view sorted on basis of "storage"

  Scenario: Sort the Files by Name
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I should select "name" from the dropdown
    Then  I should see the List view sorted on basis of "name"

  Scenario: Sort the Files by Memory
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I should select "memory" from the dropdown
    Then  I should see the List view sorted on basis of "memory"

  Scenario: Sort the Files by Role
    Given I open the Tendrl url
    When  I click on "file-share" in side nav
    And   I should select "role" from the dropdown
    Then  I should see the List view sorted on basis of "role"

  Scenario: file-share status Icon in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  I should see the file-share status Icon in list view

  Scenario: file-share name and Type in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    And   I should see the hyperlink on file-share Name
    And   I click on file-share name
    Then  I should see the object detail view

  Scenario: file-share Type in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  Then  I should see the file-share Type in list view
    
  Scenario: Donut Chart for Storage in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  I should see the "storage" Donut Chart and its values

  Scenario: Cluster name in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  I should see the "cluster" in list view

  Scenario: Bricks in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  I should see the "Bricks" in list view

  Scenario: Alerts in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    And   I should see the hyperlink on Alerts number
    And   I click on the Number
    Then  I should see the Alerts in the Event page

  Scenario: Last Rebalance in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    Then  I should see the "last-rebalance" in list view

  Scenario: Infotip on the File Share Name
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    And   I hover my mouse on Gluster name
    Then  I should see Provider and Status details

  Scenario: file-share Action icon in list view
    Given I open the Tendrl url
    When  I click "file-share" in side nav
    And   I click on Action button
    Then  I should see Edit, Start/Stop, Rebalance and Remove