""" Parser for settings.yml """

import yaml
import os
import sys

try:
    environment = os.environ.get('DASHBOARD_ENV') or 'development'

    # Read yaml file
    file_path = os.path.join(os.getcwd(), 'config', 'settings.yml')

    with open(file_path) as file_obj:
        file_data = yaml.safe_load(file_obj)
        data = file_data[environment]
# TODO write a method to navigate to parents by swim lane
# TODO we might as well can flatten the setting.yml with no parennts required

except Exception as msg:
    print "ERROR: ", msg
    sys.exit(1)
