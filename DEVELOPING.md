# Kitoon
Kitoon is a user interface for Skyring

This uses following frameworks and tools
* AngularJS
* Typescript
* SASS
* Gulp
* Browserify
* Bower

## Building
1. install latest versions of nodejs and rpm-build `dnf install nodejs npm rpm-build`
2. clone the repository `git clone git@github.com:skyrings/kitoon.git`
3. `cd kitoon`
4. run `make build-setup`
5. run `make rpm`
6. the generated rpm can be found in `${HOME}/rpmbuild/RPMS/noarch`

### Development setup in Fedora 22/23
1. install latest version of nodejs `dnf install nodejs npm`
2. install `gulp` and `tsd` gloabally - `npm install -g gulp tsd`
3. clone the repository `git clone git@github.com:skyrings/kitoon.git`
4. `cd kitoon`
5. install node modules `npm install`
6. install typescript definition files `tsd install`
7. to build `gulp compile`

Build artificats can be found in the `dist` directory

## Adding type definitions
While using an external javascript library in the project, type definitions for that library needs to be added so that typescript compiler can perform the validations. 

For example, if you need to add type definitions for lodash

1. Run `tsd query lodash`. It will return the output `- lodash / lodash`
2. Now run `tsd install lodash/lodash --save`
  - This will make a new entry in tsd.json
  - Type definitions should be available at `typings/lodash/lodash.d.ts`

## Running a local static http server
1. Install http-server `npm install -g http-server`
2. Run `http-server`
3. Open `http://localhost:8080/dist/` in the browser

## Debugging in browser
sourcemaps will be generated as part of the build process. So in the browser debugging window, you could see the typescript files(.ts). 
You could set breakpoints as like how it can be done with any javascript file. This works well in chrome browser. But the current version 
of firefox(39) is not be able to load the sourcemaps. You could either use chrome or download a nightly version of firefox(42).

## ToDo
* Experiment [angular-toastr](https://github.com/Foxandxss/angular-toastr) as a replacement for angular-growl
* Try out [angular-wizard](https://github.com/mgonto/angular-wizard), need support for custom templates
