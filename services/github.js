var GitHubApi = require('github'),
    serviceConfig = config.github;

var github = new GitHubApi({
     version: '3.0.0'
});

function authenticate() {
    github.authenticate({
        type: 'oauth',
        token: serviceConfig.accessToken
    });
}

module.exports = {

    performPreChecks: function(url, callback) {
        if(!github.auth) {
            console.log("Github authenticate")
            authenticate();
        }
        match = url.match('https://github.com/' + serviceConfig.organization + '/([^\/]+)/pull/([^\/]+)');
        if (match) {
            var repo = match[1],
                prNumber = match[2];

            github.pullRequests.get({user: serviceConfig.organization, repo: repo, number: prNumber}, function(err, res) {
              if(err) {
                console.log('Github error: ' + err);
                callback(false);
              } else {
                if (!res.merged) {
                    callback(
                        {
                            shouldSquash: (res.mergeable && res.commits != 1),
                            mergeable: res.mergeable,
                            description: res.body

                        }
                    );
                }
              }
            });
        } else {
            callback(false);
        }
    }

}

