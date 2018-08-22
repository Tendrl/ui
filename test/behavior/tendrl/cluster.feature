Feature: CLUSTER

  Scenario: Import a cluster
    Given User is on "clusters" page
     When User should see the "import" button
      And User clicks on "import" button
     Then User sees the "import-clusters" page

  Scenario: Unmanage a cluster
    Given User is on "clusters" page
     When User clicks on cluster dropdown
      And User clicks on unmanage button
      And User sees "Unmanage Cluster" dialogue box
      And User clicks on "unmanage" button
     Then User should see "unmanage cluster" "task page"
      And User closes "task page"
      And User sees cluster is unmanaged
 
  Scenario: Naming an imported cluster
    Given User is on "clusters" page
      And User should see the "import" button
      And User clicks on "import" button
      And User sees the "import-clusters" page
  	 When User enters cluster name
  	  And User clicks on "import" button
  	 Then User sees "task submitted" page
  	  And User clicks on "close" button
  	 Then User sees the "cluster" page
  	  And User sees name in cluster list view

  Scenario: Filter by valid cluster name
    Given User is on "clusters" page
     When User filters by a "valid" cluster name
     Then User should see the cluster name

  Scenario: Filter by invalid cluster name
    Given User is on "clusters" page
     When User filters by an "invalid" cluster name
     Then User should see no clusters

  Scenario: Cluster status Icon in list view
    Given User is on "clusters" page
    When  I see "cluster" list view available
    Then  I should see the Cluster status Icon in list view
  
  Scenario: Cluster name in list view
    Given User is on "clusters" page
    When  I see "cluster" list view available
    And   I should see the hyperlink on Cluster Name
    And   I click on Cluster name
    Then  I should see the object detail view

  Scenario: Cluster version in list view
    Given User is on "clusters" page
    When  I see "cluster" list view available
    And   I should see the hyperlink on Cluster Name
    And   I click on Cluster name
    Then  I should see the object detail view

  Scenario: Hosts in list view
    Given User is on "clusters" page
    When  I see "cluster" list view available
    And   I should see the hyperlink on Hosts number
    And   I click on the Number
    Then  I should see the "cluster-hosts" page

  Scenario: Cluster options dropdown is clicked
    Given User is on "clusters" page
      And User opens the clusters page
     When User clicks cluster dropdown
     Then The cluster names are listed

  Scenario: Sort the Clusters by Name
    Given User is on "clusters" page
     When User should select "name" from the dropdownzz
     Then User should see the List view sorted on basis of "name"
  
  Scenario: Sort the Clusters by Status
    Given User is on "clusters" page
     When User should select "status" from the dropdown
     Then User should see the List view sorted on basis of "status"

  Scenario: Sort the Clusters by Cluster Version
    Given User is on "clusters" page
     When User should select "status" from the dropdown
     Then User should see the List view sorted on basis of "cluster version"

  Scenario: Sort the Clusters by Managed
    Given User is on "clusters" page
     When User should select "utilization" from the dropdown
     Then User should see the List view sorted on basis of "managed"
