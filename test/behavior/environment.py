import os
import logging
from selenium import webdriver
from config_parser import data

if os.environ.get('DASHBOARD_HEADLESS') == 'true':
    from xvfbwrapper import Xvfb


def before_all(context):
    if os.environ.get('DASHBOARD_HEADLESS') == 'true':
        context.xvfb = Xvfb(width=1280, height=720)
        context.xvfb.start()
    context.data = data


def before_scenario(context, scenario):
    selenium_logger = logging.getLogger(
        'selenium.webdriver.remote.remote_connection')
    selenium_logger.setLevel(logging.WARN)
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.cache.offline.enable", False)
    profile.set_preference("network.http.use-cache", False)
    context.browser = webdriver.Firefox(profile)
    context.browser.implicitly_wait(30)


def after_scenario(context, scenario):
    context.browser.quit()


def after_all(context):
    if os.environ.get('DASHBOARD_HEADLESS') == 'true':
        context.xvfb.stop()
