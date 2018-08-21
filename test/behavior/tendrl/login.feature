Feature: LOGIN

  Scenario: Type username then delete
    Given User is at the Tendrl login page
     When User types something in the "username" field
      And User deletes what is in the "username" field
     Then The text "username is required" should appear under the "username" box

  Scenario: Type password then delete
    Given User is at the Tendrl login page
     When User types something in the "password" field
      And User deletes what is in the "password" field
     Then The text "password is required" should appear under the "password" box

  Scenario: Click login with empty fields
    Given User is at the Tendrl login page
     When User clicks the Login button
     Then The “Please fill out this field" popup should appear under the "username" box

  Scenario: Click login button with username but no password
    Given User is at the Tendrl login page
     When User types something in the "username" field
      And User clicks the Login button
     Then The “Please fill out this field" popup should appear under the "password" box

  Scenario: Click login button with password but no username
    Given User is at the Tendrl login page
     When User types something in the "password" field
      And User clicks the Login button
     Then The “Please fill out this field" popup should appear under the "username" box

  Scenario: Incorrect Username and Password
    Given User is at the Tendrl login page
     When User types in an incorrect "username"
      And User types in an incorrect "password"
      And User clicks the Login button
     Then The “username or password does not match” should appear above the "username" box
      And The text "password is required" should appear under the "password" box

  Scenario: Tendrl API is not reachable
    Given User is at the Tendrl login page
      And Tendrl API is not reachable
     When User types something in the "username" field    
      And User types something in the "password" field
      And User clicks the Login button
     Then The “Tendrl API is not reachable” should appear above the "username" box
      And The text "username is required" should appear under the "username" box
      And The text "password is required" should appear under the "password" box

  Scenario: Correct Username and Password
    Given User is at the Tendrl login page
     When User types in a correct "username"
      And User types in a correct "password"
      And User clicks the Login button
     Then User should see a "cluster" list page
