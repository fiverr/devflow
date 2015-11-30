var serviceConfig = config.slack,
    Slack = require('slack-node'),
    slack = new Slack(serviceConfig.authToken);

module.exports = {

    sendMessage: function(roomID, from, msg, color) {

        if (serviceConfig.isEnabled) {

            msg = msg.replace('I', from);
            msg = msg.replace(/<a\b[^>]*>/i, '').replace(/<\/a>/i, '');

            slack.api('chat.postMessage', {
                username: 'devflow',
                text: msg,
                icon_url: serviceConfig.icon,
                channel: serviceConfig.rooms[roomID] || roomID,
            }, function(err, response){
                console.log(response);
            });
        }
    }
}