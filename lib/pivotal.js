/**
 * lib/pivotal.js
 * Handler for pivotal updates.
 *
 * (C) Ensequence 2013
 */

// ### Dependencies
var log = require('book');

// ### Exports
module.exports = function (config) {

    // Create gitlab instance
    var gitlab = require('./gitlab')(config);

    // ### handle
    // Handles an event fom pivotal
    function handle (repo, event, cb) {
        // Check event type
        if (event.event_type === 'story_create') {
            _handleCreate(repo, event, cb);
        } else if (event.event_type === 'story_update') {
            _handleUpdate(repo, event, cb);
        } else if (event.event_type === 'note_create') {
            _handleComment(repo, event, cb);
        } else {
            cb();   
        }
    }

    // ### _handleCreate
    // Handles a story creation event
    function _handleCreate (repo, event, cb) {
        // New story; check if issue needs to be filed
        // Pull out story and type
        var story = event.stories.story[0] || event.stories.story,
            type = story.story_type;
        story.url = story.url.replace('services/v3', 's');

        // Check if story type is permitted to create issue
        if (~(config.create_on_type || []).indexOf(type)) {
            log.info('creating issue for', type, story.url);

            // Build issue
            var issue = {
                title: event.description,
                description: 'New **' + type + '** created.  See [the story](' + story.url +
                    ') for more details.  \n***Issue filed automatically by [PitLab](http://github.com/swhite24/pitlab)***',
                labels: ['pivotal', story.id, type].join(',')
            };

            // Create new issue
            gitlab.createIssue(repo, issue, function (err, result) {
                // Check err
                if (err) log.error('unable to create issue: ', err);
                else log.info('issue created successfully');

                // Invoke cb
                cb(err, result);
            });
        } else {
            cb();
        }
    }

    // ### _handleUpdate
    // Handles a story update event
    function _handleUpdate (repo, event, cb) {
        // Update story; check if issue needs created / closed
        // Pull out story and type
        var story = event.stories.story[0] || event.stories.story,
            type = story.story_type,
            state = story.current_state;
        story.url = story.url.replace('services/v3', 's');

        if (~(config.create_on_state || []).indexOf(state)) {
            // New issue
            log.info('creating issue after being', state, story.url);

            // Build issue
            var issue = {
                title: event.description,
                description: 'Story is now **' + state + '**.  See [the story](' + story.url +
                    ') for more details.  \n***Issue filed automatically by [PitLab](http://github.com/swhite24/pitlab)***',
                labels: ['pivotal', story.id, state].join(',')
            };

            // Create new issue for current state of story
            gitlab.createIssue(repo, issue, function (err, result) {
                // Check err
                if (err) log.error('unable to create issue: ', err);
                else log.info('issue created successfully');

                // Invoke cb
                cb(err, result);
            });
        } else if (~(config.close_on_state || []).indexOf(state)) {
            // Close issue
            log.info('closing issue after being', state, story.url);

            // Close issue
            gitlab.closeIssue(repo, story.id, function (err, result) {
                // Check err
                if (err) log.error('unable to close issue: ', err);
                else log.info('issue closed successfully');

                // Invoke cb
                cb(err, result);
            });
        } else {
            cb();
        }
    }

    // ### _handleComment
    // Handles a comment update
    function _handleComment (repo, event, cb) {
        // New comment; add to corresponding issue if present
        // Pull out story 
        var story = event.stories.story[0] || event.stories.story,
            note = story.notes.note[0] || story.notes.note;

        // Check if allowed to post comments
        if (config.post_comments) {
            log.info('posting comment from pivotal:', note.text);

            // Update text
            note.text = '**' + event.author + ' commented:**\n> ' + note.text +
                '\n***Comment from pivotal posted automatically by [PitLab](http://github.com/swhite24/pitlab)***';

            gitlab.postComment(repo, story.id, note.text, function (err, result) {
                // Check err
                if (err) log.error('unable to post comment: ', err);
                else log.info('comment posted successfully');

                // Invoke cb
                cb(err, result);
            });
        } else {
            cb();
        }
    }

    // Expose methods
    return {
        handle: handle
    };
};