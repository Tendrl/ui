# USM Client
USM Client is a user interface for Unified Storage Manager

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
3. clone the repository `git clone git@github.com:kmkanagaraj/usm-client-2.git`
4. `cd usm-client-2`
5. install node modules `npm install`
6. install bower dependencies `bower install`
7. install typescript definition files `tsd install`
8. to build `gulp compile`

Build artificats can be found in the `dist` directory

## Debugging in browser
sourcemaps will be generated as part of the build process. So in the browser debugging window, you could see the typescript files(.ts). 
You could set breakpoints as like how it can be done with any javascript file. This works well in chrome browser. But the current version 
of firefox(39) is not be able to load the sourcemaps. You could either use chrome or download a nightly version of firefox(42).
