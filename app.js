/**
 * app.js
 * Entry point into pitlab
 *
 * (C) Steven White 2013
 */

// ### Core Modules
var http = require('http');

// ### Dependencies
var express = require('express'),
    log = require('book');

module.exports = function (config) {
    // Instantiate express instance
    var app = express();

    // Get helpers
    var models = require('./lib')(config);

    // Configure app
    require('./conf/settings')(app);

    // Build routes
    require('./routes')(app, models);

    // Start server
    var server = http.createServer(app);
    server.listen(app.get('port'), function () {
        log.info('PitLab started on port', app.get('port'));
        log.info('Ensure your PivotalTracker projects are pointed at PitLab');
    });
};