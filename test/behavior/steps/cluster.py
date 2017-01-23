from behave import given, when, then

filter_values = {
	"cluster_name" : "Ceph",
	"cluster_status" : "up",
	"cluster_utilization" : "80"
}

@given('I open the Tendrl url')
def step_impl(context):
    context.browser.get(context.data['common']['tendrl']['ip'])

@when('I click on "{tendrl_type}" in side nav')
def step_impl(context,tendrl_type):
	link = "a[href='#/{0}'][ui-sref='{0}'".format(tendrl_type)
	context.browser.find_element_by_css_selector(link).click()

@then('I should see the "{tendrl_type}" data')
def step_impl(context, tendrl_type):
	class_name = "tendrl-{0}-list-view-container".format(tendrl_type)
	text = context.browser.find_element_by_class_name(class_name).text
	assert tendrl_type+"s" == text.split()[0].lower()

@when('I should see the "{button_name}" button')
def step_impl(context,button_name):
	pass
	#button = context.browser.find_element_by_name(button_name)

@when('I click on "{button_name}" button')
def step_impl(context,button_name):
	pass
	#button = context.browser.find_element_by_name(button_name)
	#button.click()

@then('I should see the "{following}" "{type_of}" page')
def step_impl(context, following, type_of):
	class_name = "tendrl-{0}-{1}-container".format(following,type_of)
	text = context.browser.find_element_by_class_name(class_name).text
	assert following + type_of == text.split()[0].lower()+ text.split()[1].lower()

@when('I type the "{filter_type}" of the Cluster available')
def step_impl(context,filter_type):
	filter_name = context.browser.find_element_by_id("filter")
	filter_name.send_keys(filter_values["cluster_%s" %(filter_type)])

@then('I should see the Cluster in List View')
def step_impl(context):
	cluster_found = context.browser.find_element_by_class_name("cluster-name").text
	assert filter_values["cluster_name"] == str(cluster_found)

@when('I should select "{filter_type}" from the dropdown')
def step_impl(context,filter_type):
	pass
	
@then('I should see the List view sorted on basis of "{filter_type}"')
def step_impl(context,filter_type):
	pass

@when('I see "{type}" list view available')
def step_impl(context,type):
	pass

@then('I should see the Cluster status Icon in list view')
def step_impl(context):
	pass

@then('I should see the object detail view')
def step_impl(context):
	pass

@then('I should see the Donut Chart and its values')
def step_impl(context):
	pass

@then('I should see the Sparkline Chart and its values')
def step_impl(context):
	pass

@then('I should see the Hosts page')
def step_impl(context):
	pass

@then('I should see the Pools page')
def step_impl(context):
	pass

@then('I should see the Alerts in the Event page')
def step_impl(context):
	pass

@then('I should see Provider, Status and Last Synced details')
def step_impl(context):
	pass

@then('I should see Expand, Shrink and Unmanage')
def step_impl(context):
	pass