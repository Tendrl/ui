from behave import given, when, then

@given('I open the Tendrl url')
def step_impl(context):
  context.browser.get(context.data['common']['tendrl']['ip'])


@then('I should see the Login screen')
def step_impl(context):
	context.browser.refresh()
	context.browser.implicitly_wait(3)
	assert "login" in context.browser.current_url
