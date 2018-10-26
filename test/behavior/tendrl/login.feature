Feature: LOGIN

  Scenario: Type username then delete
    Given User is at the "login" page
     When User types something in the "username" field
      And User deletes what is in the "username" field
     Then The text "username is required" should appear under the "username" box

  Scenario: Type password then delete
    Given User is at the "login" page
     When User types something in the "password" field
      And User deletes what is in the "password" field
     Then The text "password is required" should appear under the "password" box

  Scenario: Incorrect Username and Password
    Given User is at the "login" page
     When User types in an incorrect "username"
      And User types in an incorrect "password"
      And User clicks on the "login" button
     Then The "username or password you entered does not match our records" popup should appear above the "username" box
      And The text "password is required" should appear under the "password" box

  Scenario: Tendrl API is not reachable
    Given User is at the "login" page
      And Tendrl API is not reachable
     When User types something in the "username" field    
      And User types something in the "password" field
      And User clicks on the "login" button
     Then The "Tendrl API is not reachable" popup should appear above the "username" box
      And The text "username is required" should appear under the "username" box
      And The text "password is required" should appear under the "password" box

  Scenario: Correct Username and Password
    Given User is at the "login" page
     When User types in a correct "username"
      And User types in a correct "password"
      And User clicks on the "login" button
     Then User should see the "cluster" page

  Scenario: Logout from Cluster page
    Given User is at the "clusters" page
     When User clicks on the username dropdown
      And User clicks on the "logout" button
     Then User should see the "login" page
