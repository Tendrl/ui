Feature: CLUSTER_UNMANAGED

  Scenario: Cluster reported as unmanaged
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see "No" under Managed property of cluster

  Scenario: Cluster status icon reports unavailable
    Given User is on the "cluster list" page
      And has at least one cluster available
     When User hovers over cluster status icon
      And User should see status is "unknown"

  Scenario: Cluster name/uuid is reported
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see UUID of unimported cluster

  Scenario: Cluster Version info is reported
    Given User is on the "cluster list" page
      And has at least one cluster available
     Then User should see Cluster Version info

  Scenario: Hosts information is accurate
    Given User is on the "cluster list" page
    And has at least one cluster available
    Then hosts count should report actual number of hosts

  Scenario: Hosts information is clickable
    Given User is on the "cluster list" page
      And has at least one cluster available
     When User clicks on hosts count link
     Then User should be brought to host list modal

  Scenario: Cluster is unavailable for import
    Given User is on the "cluster list" page
      And has at least one cluster available
     When the cluster is unavailable for import
     Then the import button should be unusable

  Scenario: Cluster is available to import
    Given User is on the "cluster list" page
      And has at least one cluster available
     When the cluster is "Ready to import"
     Then the import button should be usable

  Scenario: Filter by valid cluster namee
    Given User is on "cluster list" page
      And has at least one cluster available
     When User filters by a "valid" cluster name
     Then User should see the cluster name

  Scenario: Filter by invalid cluster name
    Given User is on "cluster list" page
      And User has at least one cluster available
     When User filters by an "invalid" cluster name
     Then User should see no clusters

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


