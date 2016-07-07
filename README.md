# Kitoon [![Build Status](https://travis-ci.org/skyrings/kitoon.svg?branch=master)](https://travis-ci.org/skyrings/kitoon) [![Dependency Status](https://david-dm.org/skyrings/kitoon.svg)](https://david-dm.org/skyrings/kitoon) [![Issue Stats](http://issuestats.com/github/skyrings/kitoon/badge/pr?style=flat)](http://issuestats.com/github/skyrings/kitoon)

Kitoon is a graphical user interface for [SkyRing]
(https://github.com/skyrings/skyring), a modern, extensible
web-based storage management platform. Kitoon uses RESTFul API
to communicate with SkyRing server. Optionally websockets are used
to send instant notifcations from the SkyRing server to Kitoon UI.

## Features
### Management
1. Create a new storage cluster based on workload requirements
   (like OpenStack, Virtualization, Containers, etc)
2. Provisioning storage by creating gluster volumes and ceph pools
3. Support for creating gluster volumes of required size and cababilities
   like mirrored, erasure coded, tiered, etc.
4. Expanding a new cluster with aditional storage nodes
5. Expanding a gluster volume with extra space

### Monitoring
1. Dashboard to show overall system status and statistics
2. Alerts and notifications for critical events

### Miscellaneous
1. Asynchronous support long running operations
2. Responsive UI (Supports Desktop, Tab and Mobile)

### Upcoming
1. Support for instant notifications using WebSockets
2. Integration with provisioning tools like puppet/ansible
3. LDAP/AD authentication for the users
4. Support for extensions(plugins)

### How to use/run the application
The url http://<host-name/host-ip>:8080 will launch the application

### Development
Kitoon development happens in
[gerrithub.io](https://review.gerrithub.io/#/admin/projects/skyrings/kitoon).
Please submit your patches to GerritHub rather than using GitHub's Pull
Requests.

-More information about the development and build environment is available [here](./DEVELOPING.md)
