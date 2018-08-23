Feature: CLUSTER

  Scenario: User views available cluster 
    Given User is on "cluster list" page
     Then User sees one or more clusters available

  Scenario: Import Cluster page should be available
    Given User is on "cluster list" page
      And User has at least one "unmanaged" cluster
     When User should see the "import" button
      And User clicks on "import" button
     Then User sees the "import-clusters" page

  Scenario: Unmanage a cluster
    Given User is on "cluster list" page 
      And User has at least one "managed" cluster
     When User clicks on kebab menu
      And User clicks on "unmanage" button
      And User sees "Unmanage Cluster" dialog box
      And User clicks on "unmanage" button
     Then User sees "Cluster Task" dialog box
      And User closes "Cluster Tast" dialog box
      And User sees that cluster is unmanaged

  Scenario: Filter by valid cluster name
    Given User is on "cluster list" page
      And User has at least one "managed" cluster
     When User filters by a "valid" cluster name
     Then User should see the cluster name

  Scenario: Filter by invalid cluster name
    Given User is on "cluster list" page
      And User has at least one "managed" cluster
     When User filters by an "invalid" cluster name
     Then User should see no clusters

  Scenario: Cluster status Icon in list view
    Given User is on "cluster list" page
      And User has at least one "managed" cluster
     Then User should see the Cluster Status Icon
  
  Scenario: Cluster name in list view
    Given User is on "clusters" page
      And User has at least one "managed" cluster
      And User sees the hyperlink on "Cluster Name"
     When User clicks on "Cluster Name"
     Then User should see the "cluster hosts" page

  Scenario: Hosts in list view
 	Given User is on "clusters" page
      And User has at least one "managed" cluster
      And User sees the hyperlink on "Host Number"
     When User clicks on "Host Number"
     Then User should see the "hosts" dialog box

  Scenario: Cluster options dropdown is clicked
 	Given User is on "clusters" page
      And User has at least one "managed" cluster
     When User clicks cluster dropdown
     Then The cluster names are listed

  Scenario: Sort the Clusters by Name
    Given User is on "clusters" page
     When User should select "name" from the dropdown
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
