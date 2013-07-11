## PitLab

Allows integration of [PivotalTracker](http://pivotaltracker.com/) story additions, updates, and comments into [GitLab](https://github.com/gitlabhq/gitlabhq) issues.  

PitLab does not require or provide an external tool integration to import stories into PivotalTracker from GitLab.  The issues created / updated by PitLab are identified using tags.

### Setup

1. **Install PitLab**  
```
npm install -g pitlab
```

2. **Start PitLab**  
```
PITLAB_PORT=3000 pitlab path/to/config.json
```

3. **Configure Pivotal Tracker Project**  
Go to the project you wish to integrate -> Settings -> Integrations -> Activity Web Hook  
Fill in the form as follows  
  * **Web Hook URL** url to interact with PitLab, of the form `http://<host>:3000/storyupdate/<repo_path`
      * **host** is the publicly available location pitlab is deployed
      * **repo_path** is the gitlab path to the project to integrate with, including the group (e.g. \<group>/\<project>)
  * **API Version** v3

### Configuration
PitLab expects a JSON configuration file when initiated from the command line.  The configuration has the following properties:  
* **gitlab_url**: [Required] base URL of GitLab installation
* **gitlab_token**: [Required] usable API token within GitLab (found within your user profile on GitLab)
  * Note that the provided token must have access to each GitLab projected intended to be integrated with PivotalTracker.  It is recommended to create a "dummy" user with necessary privileges on each project to integrate and use its API token.
* **close_on_state**: [Optional] Array of story states indicating an issue needs to be closed.  States must be one of `started`, `finished`, `delivered`, `rejected`, `accepted`.
* **create_on_state**: [Optional] Array of story states indicating an issue needs to be created.  States must be one of `started`, `finished`, `delivered`, `rejected`, `accepted`.
* **create_on_type**: [Optional] Array of story types indicating an issue needs to be created, after the story is created within PivotalTracker.  Types must be one of `feature`, `bug`, `chore`, `release`.
* **post_comments**: [Optional] Boolean indicating whether to post comments from a story to a linked issue.

Example configuration:
```json
{
    "gitlab_url": "mygitlab.com",
    "gitlab_token": "abcd1234",
    "close_on_state": ["accepted"],
    "create_on_type": ["feature","bug"],
    "create_on_state": ["rejected"],
    "post_comments": true
}
```

### License

(The MIT License)

Copyright (c) 2013 Steven White

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.