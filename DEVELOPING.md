# USM Client
USM Client is a user interface for Unified Storage Manager

The build steps can be found at [README](./README.md)

## Running a local static http server
1. Install http-server `npm install -g http-server`
2. Run `http-server`
3. Open `http://localhost:8080/dist/` in the browser

## Debugging in browser
sourcemaps will be generated as part of the build process. So in the browser debugging window, you could see the typescript files(.ts). 
You could set breakpoints as like how it can be done with any javascript file. This works well in chrome browser. But the current version 
of firefox(39) is not be able to load the sourcemaps. You could either use chrome or download a nightly version of firefox(42).
