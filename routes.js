var index   = require('./controllers/indexController'),
    request = require('./controllers/requestController')
    server  = require('./controllers/serverController'),
    user    = require('./controllers/userController'),
    repo    = require('./controllers/repoController'),
    tag     = require('./controllers/tagController'),
    token   = require('./controllers/tokenController');

module.exports = function(app) {

    app.get('/', index.index);
    app.get('/loginError', user.loginError);
    app.get('/config', index.config);

    app.get('/request/:type', request.all);
    app.get('/review/count/:type', request.reviewCount);
    app.get('/review/:type', request.reviews);

    app.get('/server', server.all);
    app.post('/servers', server.saveAllServerEnvs);
    app.get('/server_data/:name', server.serverData)

    app.get('/users', user.getAllUsers);
    app.post('/users', user.saveAllUsers);
    app.get('/users/currentUser', user.getCurrentUser);
    app.post('/users/currentUser', user.updateCurrentUser);

    app.get('/server/rest/all', server.rest.all);
    app.post('/server/rest/take', server.rest.take);
    app.post('/server/rest/release', server.rest.release);
    app.post('/server/rest/queue', server.rest.queue);
    app.post('/server/rest/unqueue', server.rest.unqueue);
    app.post('/server/rest/extend', server.rest.extend);

    app.get('/repos', repo.getAll);
    app.post('/repos', repo.saveAll);

    app.get('/tags', tag.getAll);
    app.post('/tags', tag.saveAll);

    app.get('/token/generate', token.generate);
}
