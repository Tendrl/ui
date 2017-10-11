#!/usr/bin/env node

// A dev server leveraging browser-sync for live reloads
// Invoke with the "-P <url>" option to delegate /api calls to a backend

var bs = require("browser-sync").create();
var httpProxy = require("http-proxy");
var minimist = require("minimist");
var knownOptions = {
    string: "P",
    default: false
};
var options = minimist(process.argv.slice(2), knownOptions);

function serve() {
    var proxy = httpProxy.createProxyServer({secure: false});
    var bsOptions = {
        server: "dist",
        files: "dist/**/*.*",
    };
    if (options.P) {
        console.log("\x1b[35m" + "Setting up a /api proxy for", options.P + "\x1b[0m");
        bsOptions.middleware = [{
            route: "/api",
            handle(req, res, next) {
                if (req.url.indexOf(".json") > -1) {
                    next();
                } else {
                    req.url = "/api" + req.url;
                    console.log("\x1b[35m" + "proxying request:", req.url + "\x1b[0m");
                    proxy.web(req, res, {
                        target: options.P,
                        changeOrigin: false
                    });
                }
            }
        }];
    }
    bs.init(bsOptions);
}

serve();