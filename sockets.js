var io      = require('socket.io'),
    request = require('./controllers/requestController'),
    server  = require('./controllers/serverController');

module.exports = function(nodeServer) {

    var socketConn = io.listen(nodeServer);

    // Socket endpoints
    socketConn.sockets.on('connection', function (socket) {

        socket.setSocketEvent = function (event, func, broadcastEvent, async) {
            socket.on(event, function(data, fn) {

                var reportFinish = function(retData) {
                  if (broadcastEvent) {
                        socket.broadcast.emit(broadcastEvent, retData ? retData : data);
                    }

                    if (retData) {
                        fn(retData);
                    }
                }

                if (async) {
                    func(data, function(retData) {
                        reportFinish(retData);
                    });
                } else {
                    reportFinish(func(data));
                }


            });
        }

        // Requests
        socket.setSocketEvent('addRequest', request.add, 'requestAdded');
        socket.setSocketEvent('takeRequest', request.take, 'requestTaken');
        socket.setSocketEvent('completeRequest', request.complete, 'requestCompleted');
        socket.setSocketEvent('releaseRequest', request.release, 'requestReleased');
        socket.setSocketEvent('updateRequest', request.update, 'requestUpdated');
        socket.setSocketEvent('deleteRequest', request.delete, 'requestDeleted');
        socket.setSocketEvent('nudgeRequest', request.nudge, 'requestNudged');
        socket.setSocketEvent('preCheckRequest', request.preChecks, null, true);

        // Servers
        socket.setSocketEvent('takeServer', server.take, 'serverTaken');
        socket.setSocketEvent('queueServer', server.queue, 'serverQueued');
        socket.setSocketEvent('unqueueServer', server.unqueue, 'serverUnqueued');
        socket.setSocketEvent('queueEnv', server.queueEnv, 'envQueued');
        socket.setSocketEvent('unqueueEnv', server.unqueueEnv, 'envUnqueued');
        socket.setSocketEvent('releaseServer', server.release, 'serverReleased');
        socket.setSocketEvent('changeServerDownState', server.downStateChanged, 'serverDownStateChanged');
        socket.setSocketEvent('extendServer', server.extend, 'serverExtended');

        // On-demand Servers
        socket.setSocketEvent('createServer', server.create, 'serverCreated', true);
        socket.setSocketEvent('killServer', server.kill, 'serverKilled', true);
    });

    return (socketConn);
}
