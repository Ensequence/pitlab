/**
 * Gruntfile.js
 * Grunt setup / configuration
 *
 * (C) Steven White 2013
 */

// ### Exports
module.exports = function (grunt) {

    // Configure grunt
    grunt.initConfig({
        jshint: {
            all: ['app.js', 'conf/*.js', 'routes/*.js', 'lib/*.js']
        }
    });

    // Load in tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Register tasks
    grunt.registerTask('default', ['jshint']);
};