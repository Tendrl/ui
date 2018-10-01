Feature: CLUSTER_UNMANAGED

  Scenario: User sees cluster lists page after logging in
    Given User opens the Tendrl link
     When User passes correct login information
     Then User should see "cluster list" page

  Scenario: User sees cluster is unmanaged
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see "No" under Managed

  Scenario: User sees cluster status icon
    Given User is on the "cluster list" page
      And has at least one cluster available
     When User hovers over cluster status icon
      And User should see status is unknown

  Scenario: User sees the cluster name/uuid
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see UUID of unimported cluster

  Scenario: User sees Cluster Version info
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see Cluster Version info

  Scenario: User sees hosts information
    Given User is on the "cluster list" page
      And has at least one cluster available
     When User clicks on hosts link
     Then User should be brought to hosts page

  Scenario: Cluster is unavailable for import
    Given User is on the "cluster list" page
      And has at least one cluster available
     When the cluster is unavailable for import
     Then the import button should be unusable

  Scenario: Cluster is available to import
    Given User is on the "cluster list" page
      And has at least one cluster available
     When the cluster is available for import
     Then the import button should be usable

  Scenario: Filter by valid cluster name
    Given User is on "cluster list" page
      And has at least one cluster available
     When User filters by a "valid" cluster name
     Then User should see the cluster name

  Scenario: Filter by invalid cluster name
    Given User is on "cluster list" page
      And User has at least one cluster available
     When User filters by an "invalid" cluster name
     Then User should see no clusters
  
  Scenario: User logs out
    Given User is on the "cluster list" page
     When User clicks on "usermenu dropdown"
      And User clicks logout
     Then User should see "login" page

  Scenario: Sort by ascending cluster name
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "Name"
      And User selects ascending sort direction
     Then User sees first cluster as first entry

  Scenario: Sort by descending cluster name
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "Name"
      And User selects descending sort direction
     Then User sees last cluster as first entry

  Scenario: Sort by ascending cluster status
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "status"
      And User selects ascending sort direction
     Then User sees first cluster as first entry

  Scenario: Sort by descending cluster status
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "status"
      And User selects descending sort direction
     Then User sees last cluster as first entry

  Scenario: Sort by ascending cluster version
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "version"
      And User selects ascending sort direction
     Then User sees first cluster as first entry

  Scenario: Sort by descending cluster version
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "version"
      And User selects descending sort direction
     Then User sees last cluster as first entry

  Scenario: Sort by ascending cluster managed
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "managed"
      And User selects ascending sort direction
     Then User sees first cluster as first entry

  Scenario: Sort by descending cluster managed
    Given User is on the "cluster list" page
      And User has at least two clusters available
     When User clicks sorting dropdown
      And User selects "managed"
      And User selects descending sort direction
     Then User sees last cluster as first entry


