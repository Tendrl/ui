from behave import given, when, then

@given('I open the Tendrl url')
def step_impl(context):
  context.browser.get(context.data['common']['tendrl']['ip'])

@then('I should see the Login screen')
def step_impl(context):
	assert "login" in context.browser.current_url