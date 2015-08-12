# Kitoon [![Build Status](https://travis-ci.org/skyrings/kitoon.svg?branch=master)](https://travis-ci.org/skyrings/kitoon)

Graphical user interface for [SkyRing] (https://github.com/skyrings/skyring)

This uses following frameworks and tools
* AngularJS
* Typescript
* SASS
* Gulp
* Browserify
* Bower

## How to build
### Fedora 20/21/22
1. install latest version of nodejs `yum install nodejs npm`
2. install `gulp`, `bower` and `tsd` gloabally - `npm install -g gulp bower tsd`
3. clone the repository `git clone git@github.com:skyrings/kitoon.git`
4. `cd kitoon`
5. install node modules `npm install`
6. install bower dependencies `bower install`
7. install typescript definition files `tsd install`
8. to build `gulp compile`

Build artificats can be found in the `dist` directory

More information about the development is available [here](./DEVELOPING.md)
