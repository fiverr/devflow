var express        = require('express'),
    path           = require('path'),
    http           = require('http'),
    sassMiddleware = require('node-sass-middleware'),
    mongoose       = require('mongoose'),
    domain         = require('domain'),
    jwt            = require('jsonwebtoken'),
    app            = express(),
    env            = app.get('env'),
    config         = require(process.env.DEVFLOW_CONFIG || './config')(env),
    port           = process.env.PORT || config.port,
    d              = domain.create();

// set config as a global var
global.config = config;

// setup app general settings
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('superSecret', config.apiSecret);
// app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.compress());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: config.sessionSecret }));

// setup authentication
require('./auth')(app);

app.use(app.router);

// connect to db
mongoose.connect(config.mongo);

// concat and uglify
require('./compress').compress(env);

// setup sass middleware
app.use(
    sassMiddleware({
        src: __dirname + '/sass',
        dest: __dirname + '/public/styles',
        prefix:  '/styles',
        debug: true
    })
);

app.use(express.static(path.join(__dirname, 'public')));

// setup routes
require('./routes')(app);

// Must be after all the routes to catch errors.
app.use(express.errorHandler);

// Init server
var nodeServer = http.createServer(app);

// init sockets
global.sockets = require('./sockets')(nodeServer).sockets;

// init jobs
require('./jobs');

// Init global error catch
d.on('error', function(err) {
    console.error(err);
});

// start server
nodeServer.listen(port, function() {
    console.log('Devflow server listening on port ' + port);
});
