import time
from behave import given, when, then


keyword_dict = {'incorrect_input': 'incorrect'}


@given('User is at the "{view}" page')
def step_impl(context, view):
    if view == "login":
       context.browser.get(context.data['common']['tendrl']['ip'])
       time.sleep(1)
    if view == "clusters":
        context.execute_steps(u"""
                          Given User is at the "login" page
                          When User types in a correct "username"
                          And User types in a correct "password"
                          And User clicks on the "login" button
                          """)


@given('Tendrl API is not reachable')
def step_impl(context):
    pass


@when('User types in a correct "{field}"')
def step_impl(context, field):
    context.browser.find_element_by_id(field).send_keys(
        context.data['common']['tendrl'][field])


@when('User types in an incorrect "{field}"')
def step_impl(context, field):
    context.browser.find_element_by_id(field).send_keys(
        keyword_dict['incorrect_input'])


@when('User types something in the "{field}" field')
def step_impl(context, field):
    context.browser.find_element_by_id(field).send_keys(
        keyword_dict['incorrect_input'])


@when('User deletes what is in the "{field}" field')
def step_impl(context, field):
    context.browser.find_element_by_id(field).clear()


@when('User clicks on the "{field}" button')
def step_impl(context, field):
    button = field.lower() + "Button"
    context.browser.find_element_by_id(button).click()


@when('User clicks on the username dropdown')
def step_impl(context):
    context.browser.find_element_by_id('usermenu').click()


@then('User should see the "{field}" page')
def step_impl(context, field):
    assert field in context.browser.current_url


@then('The text "{field} is required" should appear under the "{field}" box')
def step_impl(context, field):
    element_id = field + "HelpBlock"
    block_text = context.browser.find_element_by_id(element_id).text.lower()
    assert block_text == field + " is required"


@then('The {message} popup should appear above the {field} box')
def step_impl(context, message, field):
    message = message[1:-1]
    popup_text = context.browser.find_element_by_id("errorMsg").text
    assert message in popup_text
