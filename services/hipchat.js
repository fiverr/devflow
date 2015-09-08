var http          = require('http'),
    querystring   = require('querystring'),
    serviceConfig = config.hipchat;

module.exports = {

    sendMessage: function(roomID, from, msg, color) {

        if (serviceConfig.isEnabled) {

            var data = querystring.stringify({
                room_id: serviceConfig.rooms[roomID] || roomID,
                from: from,
                message: msg,
                message_format: 'html',
                notify: 1,
                color: color
            });

            var options = {
                host: 'api.hipchat.com',
                port: 80,
                path: '/v1/rooms/message?format=json&auth_token=' + serviceConfig.authToken,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(data)
                }
            };

            var req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('body: ' + chunk);
                });
            }).on('error', function(e){
                console.log('Got error: ' + e.message);
            });

            req.write(data);
            req.end();
        }
    }
}
