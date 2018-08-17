Tendrl End to End Testing
=======

Feature files are living documentation. They hold functionality of the code described in a DSL understandeable as plain english. This DSL is then parsed by programming-language-specific libraries, and translated into end-to-end tests.

Framework
----
The Gherkin syntax is used to describe features/scenarios.
Behave is used to run our tests, with selenium on Firefox.

Tags
----
The @skip tag may be used to skip scenarios or entire features if needed.

Directory Structure
----
- `features/` has feature files, in the Given, When, Then Gherkin syntax
- Inside the `features/` directory, the `.feature` files are categorized into storage entities, and a `tendrl.feature` file, which holds features that are specific to tendrl or do not belong to any storage entities
- `steps/` has step definitions

Requirements
---
- Xvfb _To be able to run selenium in headless mode_
- Ensure python pip package installed before performing the installation process

Installation
----
```
git clone https://github.com/Tendrl/ui -b "functional-test"
cd ui
pip install behave
pip install selenium
pip install pyyaml
pip install xvfbwrapper # Only if you want to run browser in headless mode

Alternatively, you can run "pip install -r requirements.txt" from the root of the source tree to install the requisite Python packages.
```

Configuration Settings
----
`config/settings.yml` provides configuration options for all environments (development/qa/stage).
The default environment is 'development', but can be specified as `TENDRL_UI_ENV` environment variable.

For example:
1. Enter value for "tendrl" uri in settings.yml, qa: section
2. Set 'TENDRL_UI_ENV' with following command:
   `export TENDRL_UI_ENV=qa`

'config/settings.yml' is loaded to context.data variable in order for it to be used globally across behave scripts. Please add your config structure to `config/settings.yml` first and the you can retrieve it from context.data.

Run Tests
----
From the test/behaviour,

`behave`

Headless mode
----
For running on systems without a display (such as jenkins), we need to use headless mode.

- Install Xvfb. `xorg-X11-server-Xvfb` on fedora/RHEL
- For python, install xvfbwrapper: `pip install xvfbwrapper`

Tests can be run in headless mode by setting the `TENDRL_UI_ENV` environment variable to true
