/**
 * lib/pitlab-error.js
 * Errors delivered by pitlab
 *
 * (C) Steven White 2013
 */

// ### Core Modules
var util = require('util');

// ### Exports
module.exports = PitlabError;

// ### Restricted Resource Error
// Error to send when restricted resource not queried properly
function PitlabError (message, code) {
    Error.captureStackTrace(this, this);
    this.message = message;
    this.code = code || 400;
}
util.inherits(PitlabError, Error);