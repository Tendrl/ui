# UI [![Build Status](https://travis-ci.org/Tendrl/ui.svg?branch=master)](https://travis-ci.org/Tendrl/ui) [![Dependency Status](https://david-dm.org/Tendrl/ui.svg)](https://david-dm.org/Tendrl/ui) [![Issue Stats](http://issuestats.com/github/Tendrl/ui/badge/pr?style=flat)](http://issuestats.com/github/Tendrl/ui)

UI is a graphical user interface for [Tendrl](https://github.com/Tendrl), a modern, extensible web-based storage management platform, using RESTFul API to communicate with Tendrl API server.

# UI: Development #

UI is a static webapp, built from a Node.js project. This document details how to contribute to the project as a developer.

## Prerequisites ##

### Required skills/expertise ###

* Experience of webapplication development
* Understanding of JavaScript, CSS, HTML
* Familiarity with Node.js & npm
* Familiarity with angularjs

### Setting up workstation ###

Make sure you have `git`, `nodejs`, `npm` installed in your system, along with your favorite code-editor & browser with devtools (latest Mozilla Firefox or Google Chrome recommended).

Follow your platform's own process to set these up. On a Fedora PC, you'll use

```sh
$ sudo dnf install -y git nodejs npm
```

## Obtaining the source ##

Fork the [upstream repo](https://github.com/Tendrl/ui) to your own GitHub account.

*This is required.*

You will be working/making changes on your own repo, and create [pull requests](https://help.github.com/articles/about-pull-requests/) to submit changes to the upstream. Upon peer-review, those changes will be merged, if everything went well. You should never directly push to the upstream, even if you have write access.

Once forked, you can clone the repo to your workstation for development:

```sh
$ git clone git@github.com:GitHubUsername/ui.git
$ cd ui
```

### Reaching out ###

To communicate with the existing developers, ask for help/clarifications etc. send an email to tendrl-devel@redhat.com prepending `[Frontend]` in the subject line. This is the mailing list for Tendrl developers, and to be in the loop you should subscribe here: https://www.redhat.com/mailman/listinfo/tendrl-devel.

## Contributing ##

### Coding guidelines ###

Follow standard frontend development best practices to work on the code.Consult [this](http://taitems.github.io/Front-End-Development-Guidelines/) and [this](https://isobar-idev.github.io/code-standards/) consolidated guides for further details.

In case of confusion or conflict of opinions, please [create an issue](https://github.com/Tendrl/ui/issues/new) to start the discussion.

### Building from source ###

Within the git cloned source directory, run the following commands to build the app. You should be able to build from the source successfully before making any changes to the source.


```sh
$ sudo npm install -g gulp
$ npm install
$ gulp
```

Upon success of all the steps, you should have the build artifacts in `./dist/` subdirectory.

You can also run `gulp dev` command. It will add watchers to all files and accordingly dist folder will be updated continuosly.

### Running a dev-server ###

To run and test the build locally, you can use various static file server over HTTP. We recommend using `http-server` module, however, httpd/nginx etc can as well be used.


```sh
$ npm install -g http-server
$ cd dist
$ http-server # starts the web-server with doc-root as `pwd`
```

The advantage of using `http-server` module is that, it's easy to use it with another existing server which can handle the request, which the test server is incapable of serving.


```sh
$ http-server -P http://production.server/
```

You should be able to browse the app, running on test server by visiting http://127.0.0.1:8080 from your browser.

### Making changes ###

* Make sure to pull from `upstream/master` before starting to work on something
* Preferably create a branch, after the pull to work on a specific issue
* Fix one thing per commit - neither more, nor less
* Fixing an issue may require a bunch of commits - that's okay
* Give meaningful commit messages, if necessary add descriptions
* Signing off code isn't mandatory but is recommended
* Do not introduce different line-ending conventions in your code (especially
if using non-*nix systems)
* Comment/document your code in a way, any new contributor can understand the
concept behind the implementation
* Make sure to write tests for the feature you add
* Make sure not to break tests of other features while working on one

### Submitting pull requests ###

Once you've successfully made some changes, built, ran, tested and pushed to your GitHub remote - then you should submit a pull request for the changes to be applied on the upstream repo.

Use [GitHub's interface](https://help.github.com/articles/about-pull-requests/) to create new pull requests. Once submitted, the code will go through some automated tests, integration and peer-reviews.

You might be asked for clarification or requested to update your code depending on the review. You can append new commits to fix those nits on the same branch of your repo, and the pull request should be automatically updated to reflect those changes.

Once approved, your code will be merged with the upstream.

Rejoice!

## Next steps ##

If you enjoyed contributing to UI, pick up another issue. If you need help, reach out to us on mailing list. If you've successfully submitted a few changes, feel free to ask to be a member of the GitHub org.

_May the source be with you._



# UI: Deployment #

UI is a static webapp, built from a Node.js project. This document details how to build from the source, and then how to configure the webhost to serve the app.

## Basic Requirements ##

### Minimum System Requirements ###

This is the bare minimal requirements for a VM to be able to run the Tendrl frontend server. However, for performance and efficiency, more resources would be good to avail:

* *CPU:* 1 core, 1 thread
* *RAM:* 512 MiB
* *Storage:* 10GiB
* *OS:* RHEL 7.x or similar

### Package dependencies ###

* httpd or, nginx

### Build dependencies ###

*Only required if building from source:*

Installed with distro's package manager: `git`, `nodejs`, `npm` + Installed with `npm`: `gulp`, <add more>

## How to Deploy ##

To deploy UI, you may want to build from source, or install the package.

* *If installing from package*, skip the "Building from source" section
* *If building from source*, likewise, skip "Installing from repo" section

TIP: This entire process should be handled by a bootstrapping script in future.

NOTE: _The commands listed here assumes latest version of Fedora in use as the host OS, use proper substitution if your environment differ._

### Step 1: Preparing host ###

#### If you're on *Fedora* ####
Nothing to do here, jump to next step.

#### If you're on *RHEL* ####
You need to register and activate your subscription with customer portal ID to add repos and install packages. _@TODO: process details & guides._

#### If you're on *CentOS* ####
You need to enable EPEL repo with `yum install epel-release`

#### If you're on *Other Distro* ####
Follow along the next steps, and depending on distros, some processes, commands and package names may vary.

### Step 2: Building from source ###

First we need the essential packages

```sh
$ sudo dnf install -y git nodejs npm
```

Then we need the frontend source

```sh
$ git clone https://github.com/Tendrl/ui.git
$ cd ui
```

Next we will install the dependencies for the package to build

```sh
$ sudo npm install -g gulp
$ npm install
```

Lastly, the build... which is an one step process, using gulp to automate the underlying steps

```sh
$ gulp
```

Once gulp finishes compiling, the build artifacts will be available in the `dist` subdirectory within the source path.

### Step 3: Installing from repo ###

_@TODO: content to be added when package details are available._

### Step 4: Serving the application ###

In this step, we take the build artifacts and serve them as web contents.

_@TODO: if installed from package, depending on which all steps are covered in the process, this section might need updating._

---

#### Configure firewall ####

For the server to be able to accept and serve external http requests, we need to configure the firewall.

This isn't required to be the first step (and can be done after installing the webserver), however, this is a common step for whatever webserver we choose to go with up next.

```sh
$ sudo firewall-cmd --permanent --zone=public --add-service=http
$ sudo firewall-cmd --reload
```

---

#### Serve using nginx ####

First, let's install and start `nginx`

```sh
$ sudo dnf install -y nginx
$ sudo systemctl start nginx
```

At this point, you should be able to see the default nginx webpage, by visiting `http://<hostname.or.ip.address>/` from your browser.

Now, to serve the app content (instead of the default page) you can take either of the 2 following ways (among many other possible, less desirable ways):

. *Easy way:* copy over app contents to nginx's default webroot
.. Backup the default pages: `$ sudo mv /usr/share/nginx/html /usr/share/nginx/default`
.. Copy over the app contents: `$ cp -r <source-path>/dist /usr/share/nginx/html`
. *Right way:* follow along [nginx's official documentation](https://www.nginx.com/resources/admin-guide/serving-static-content/) on how to configure the server for serving static webapp.

---

#### Serve using httpd ####

Again, let's install and start Apache first

```sh
$ sudo dnf install -y httpd
$ sudo systemctl start httpd
```

At this point, you should be able to see the default httpd webpage, by visiting `http://<hostname.or.ip.address>/` from your browser.

Now, to serve the app content (instead of the default page) you can take either of the 2 following ways (among many other possible, less desirable ways):

. *Easy way:* copy over app contents to httpd's default webroot: `$ cp -r <source-path>/dist/* /var/www/html/`
. *Right way:* follow along [Apache's official documentation](https://httpd.apache.org/docs/trunk/configuring.html) on how to configure the server for serving static webapp.

---

If everything went well, then browsing `http://<hostname.or.ip.address>/` from
your web-browser should give you Tendrl's frontend landing page. *Congrats!*
