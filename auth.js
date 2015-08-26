var passport   = require('passport'),
    googleAuth = require('passport-google-oauth2').Strategy,
    user       = require('./controllers/userController');

module.exports = function(app) {
    
    app.use(passport.initialize());
    app.use(passport.session());

    // Setup Authentication
    passport.use(new googleAuth({
        clientID:     config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL:  config.google.callbackURL,
        passReqToCallback: true
    }, user.authenticate));

    passport.serializeUser(user.serializeUser);
    passport.deserializeUser(user.deserializeUser);

    // google auth routes
    app.get('/auth/google',
        passport.authenticate('google', { scope: 
        [ 'https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
    ));

    app.get('/auth/google/callback', 
        passport.authenticate('google', { 
            successRedirect: '/',
            failureRedirect: '/loginError'
    }));
}
