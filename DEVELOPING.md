# Kitoon
Kitoon is a user interface for Skyring

The build steps can be found at [README](./README.md)

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
* Experiment [angular-toasty](http://invertase.github.io/angular-toasty/example/) as a replacement for angular-growl
