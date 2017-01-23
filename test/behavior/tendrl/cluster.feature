Feature: CLUSTER

  Scenario: List view is available
    Given I open the Tendrl url
    Then  I should see the "cluster" data

  Scenario: Import the Clusters 
    Given I open the Tendrl url
    When  I should see the "import" button
    And   I click on "import" button
    Then  I should see the "import" "cluster" page

  Scenario: Create the Clusters 
    Given I open the Tendrl url
    When  I should see the "create" button
    And   I click on Create button
    Then  I should see the "add" "cluster" page

  Scenario: Search the Clusters by Name
    Given I open the Tendrl url
    When  I type the "name" of the Cluster available
    Then  I should see the Cluster in List View

  Scenario: Search the Clusters by Provider
    Given I open the Tendrl url
    When  I select "provider" from the dropdown
    And   I type the "provider" of the Cluster available
    Then  I should see the Cluster in List View

  Scenario: Sort the Clusters by Name
    Given I open the Tendrl url
    When  I should select "name" from the dropdown
    Then  I should see the List view sorted on basis of "name"

  Scenario: Sort the Clusters by Status
    Given I open the Tendrl url
    When  I should select "status" from the dropdown
    Then  I should see the List view sorted on basis of "status"

  Scenario: Sort the Clusters by Utilization
    Given I open the Tendrl url
    When  I should select "utilization" from the dropdown
    Then  I should see the List view sorted on basis of "utilization"

  Scenario: Cluster status Icon in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    Then  I should see the Cluster status Icon in list view

  Scenario: Cluster name in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I should see the hyperlink on Cluster Name
    And   I click on Cluster name
    Then  I should see the object detail view
    
  Scenario: Donut Chart in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    Then  I should see the Donut Chart and its values

  Scenario: Sparkline Chart in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    Then  I should see the Sparkline Chart and its values

  Scenario: Hosts in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I should see the hyperlink on Hosts number
    And   I click on the Number
    Then  I should see the Hosts page

  Scenario: Pools in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I should see the hyperlink on Pools number
    And   I click on the Number
    Then  I should see the Pools page

  Scenario: Alerts in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I should see the hyperlink on Alerts number
    And   I click on the Number
    Then  I should see the Alerts in the Event page

  Scenario: Infotip on the Clusters Name
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I hover my mouse on Gluster name
    Then  I should see Provider, Status and Last Synced details

  Scenario: Cluster Action icon in list view
    Given I open the Tendrl url
    When  I see "cluster" list view available
    And   I click on Action button
    Then  I should see Expand, Shrink and Unmanage
