/** 
 * lib/gitlab.js
 * Model of GitLab api
 *
 * (C) Ensequence 2013
 */

// ### Dependencies
var request = require('request'),
    LRU = require('lru-cache'),
    PitLabError = require('./pitlab-error');

// ### Exports
module.exports = function (conf) {
    // Create cache
    var cache = LRU({
        max: 300,
        maxAge: 1000 * 60 * 60 * 12
    });

    // Pull out gitlab configuration
    var baseUrl = (/^http/.test(conf.gitlab_url) ? '' : 'http://') + conf.gitlab_url + '/api/v3',
        token = conf.gitlab_token;

    // ### createIssue
    // Create an issue for a project
    function createIssue (path, issue, cb) {
        // Find correct project
        _findProjectWithPath(path, function (err, project) {
            // Check err
            if (err) return cb(err);

            // Submit issue
            _gitlabRequest('POST', '/projects/' + project.id + '/issues', issue, cb);
        });
    }

    // ### closeIssue
    // Closes an issue
    function closeIssue (path, id, cb) {
        // Find issue
        _findIssueWithStoryId(path, id, function (err, issue) {
            // Check err
            if (err) return cb(err);

            // Close issue
            _gitlabRequest('PUT', '/projects/' + issue.project_id + '/issues/' + issue.id, { state_event: 'close' }, cb);
        });
    }

    // ### postComment
    // Posts a new comment to an issue
    function postComment (path, id, comment, cb) {
        // Find correct issue
        _findIssueWithStoryId(path, id, function (err, issue) {
            // Check err
            if (err) return cb(err);

            // Post comment
            _gitlabRequest('POST', '/projects/' + issue.project_id + '/issues/' + issue.id + '/notes', { body: comment }, cb);
        });
    }

    // ### _findProjectWithPath
    // Finds project matching provided path
    function _findProjectWithPath (path, cb) {
        // Check cache for project
        if (cache.has(path)) {
            cb(null, cache.get(path));
        } else {
            _getProjects(function (err, projects) {
                if (err) return cb(err);

                // Find project
                var project = projects.reduce(function (prev, project) {
                    if (project.path_with_namespace === path) return project;
                    return prev;
                }, null);

                // Check that project was found
                if (project) {
                    cache.set(path, project);
                    return cb(null, project);
                }
                cb(new PitLabError('Unrecognized project: ' + path));
            });
        }
    }

    // ### _findIssueWithStoryId
    // Finds an issue
    function _findIssueWithStoryId (path, id, cb) {
        _getProjectIssues(path, function (err, issues) {
            if (err) return cb(err);

            // Find issue
            var issue = issues.reduce(function (prev, issue) {
                if (~issue.labels.indexOf(id) && ~issue.labels.indexOf('pivotal') && issue.state !== 'closed') return issue;
                return prev;
            }, null);

            // Deliver issue
            if (issue) return cb(null, issue);
            cb(new PitLabError('No issue found to update for story id ' + id + ' in project ' + path));
        });
    }

    // ### _getProjectIssues
    // Retrieve issues for a project
    function _getProjectIssues (path, cb) {
        _findProjectWithPath(path, function (err, project) {
            if (err) return cb(err);
            _gitlabRequest('GET', '/projects/' + project.id + '/issues?per_page=100', cb);
        });
    }

    // ### _getProjects
    // Retrieves list of projects available to use identified by token
    function _getProjects (cb) {
        _gitlabRequest('GET', '/projects?per_page=100', cb);
    }

    // ### _gitlabRequest
    // Generic function to make request to gitlab
    function _gitlabRequest (method, path, body, cb) {
        // Check params
        if (typeof body === 'function') {
            cb = body;
            body = null;
        }

        // Build request options
        var options = {
            method: method,
            uri: baseUrl + path,
            headers: {
                'PRIVATE-TOKEN': token
            }
        };

        // Check if body needs to be added
        if (body) options.json = body;

        // Make request
        request(options, function (err, response, body) {
            if (err) return cb(err);
            if (typeof body !== 'object') {
                try {
                    body = JSON.parse(body);
                } catch (ex) {
                }
            }
            if (response.statusCode >= 400) return cb(body);
            return cb(null, body);
        });
    }

    // Expose methods
    return {
        createIssue: createIssue,
        closeIssue: closeIssue,
        postComment: postComment
    };
};