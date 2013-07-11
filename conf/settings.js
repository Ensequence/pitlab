/**
 * conf/settings.js
 * Express configuration
 *
 * (C) Steven White 2013
 */

// ### Dependencies
var express = require('express'),
    xml2js = require('xml2js');

// ### Exports
module.exports = function (app) {
    // Basic express setup
    app.set('port', process.env.PITLAB_PORT || 3000);
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // Create xml parser
    var parser = new xml2js.Parser({
        trim: true,
        emptyTag: null,
        explicitArray: false
    });

    // Add xml parser middleware
    app.use(function (req, res, next) {
        // Short circuit if necessary
        if (req.method !== 'POST' || req.get('Content-Type') !== 'application/xml') return next();

        // Get body & parse
        var buf = '';
        req.on('data', function (chunk) {
            buf += chunk;
        });

        req.on('end', function () {
            parser.parseString(buf, function (err, json) {
                // Handle error
                if (err) {
                    // Indicate user error
                    err.code = 400;
                    return next(err);
                }

                // Deliver body
                req.body = massageObj(json);
                next();
            });
        });
    });

    // Add router
    app.use(app.router);

    // ### Massabe Obj
    // Sets attributes as properties and '_' as 'value'
    // All properties are camelcase
    function massageObj (obj) {
        // Check each property
        for (var key in obj) {
            // Attributes
            if (key === '$') {
                delete obj[key];
            // Value
            } else if (key === '_') {
                obj = obj[key];
                delete obj[key];
            // Property
            }  else {
                // Massage each element in array
                if (obj[key] instanceof Array) {
                    for (var i = 0, len = obj[key].length; i < len; i++) {
                        obj[key][i] = massageObj(obj[key][i]);
                    }
                // Massage property
                } else if (typeof obj[key] === 'object') {
                    obj[key] = massageObj(obj[key]);
                }
            }
        }
        // Return object
        return obj;
    }
};