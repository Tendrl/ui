/*
 * This can be used like following
 *
 * {{ someexpresssion | bytes }}
*/

(function () {
    "use strict";
    var app = angular.module("TendrlModule");
    
    app.filter("bytes", function() {
        return function(bytes, precision) {
            if(bytes === 0) return "0.0 bytes"
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        }
    });
    
    app.filter("capitalize", function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

}());

