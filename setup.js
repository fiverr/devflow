var mongoose = require('mongoose'),
    ServerEnv = require('./models/serverEnvironment'),
    User = require('./models/user'),
    prompt = require('prompt'),
    fs = require('fs');

mongoose.connect('mongodb://localhost:27017/devflow');

var configExists = true;

try {
    fs.accessSync('config.js');
} catch (ex) {
    configExists = false;
}

if (configExists) {
    console.log('config.js already exists');
    process.exit(1);
}

prompt.start();

console.log('\n\nPlease enter the next mandatory details for setup:');
var inputFields = ['domainName', 'googleClientID', 'googleClientSecret', 'googleCallbackURL', 'adminEmail'];

prompt.get(inputFields, function (err, result) {
    var configFile = fs.readFileSync('config.js.dev', 'utf-8');
    
    for (var i=0; i<inputFields.length; i++) {
        var fieldName = inputFields[i];
            fieldValue = result[fieldName];

        if (!fieldValue) {
            console.log(fieldName + ' is missing, stopping creation.');
            process.exit(1);
        }

        configFile = configFile.replace(new RegExp('{{' + fieldName + '}}', 'g'), fieldValue);
    }

    console.log('Creating your config...');

    fs.writeFileSync('config.js', configFile);

    var user = new User({id: null, email: result['adminEmail'], name: null, image: null, associated: false, role: 'admin' }),
    env1 = new ServerEnv({name: 'Env1', order: 1, queue: [], servers: [{environment: 'Env1', name: 'Server11', queue: [], taken_since: null, release_date: null, is_down: false, user: null, url: null},
                                                         {environment: 'Env1', name: 'Server12', queue: [], taken_since: null, release_date: null, is_down: false, user: null, url: null}]}),
    env2 = new ServerEnv({name: 'Env2', order: 2, queue: [], servers: [{environment: 'Env2', name: 'Server21', queue: [], taken_since: null, release_date: null, is_down: false, user: null, url: null},
                                                         {environment: 'Env2', name: 'Server22', queue: [], taken_since: null, release_date: null, is_down: false, user: null, url: null}]});

    var finish = function() {
        console.log('Your devflow setup is ready!');
        console.log('Setup Additional communication settings (Hipchat, Slack, Mail) in the config production section...');
        process.exit();
    };

    user.save(function(err) {
        env1.save(function(err) {
            env2.save(function(err) {
                finish();
            });
        });
    });
});
