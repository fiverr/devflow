module.exports = {

    index: function(req, res) {
        if (!req.user) {
            res.redirect('/auth/google');
        } else {
            res.sendfile('public/views/index.html');
        }
    },

    config: function(req, res) {
        var settings = Object.assign({}, config.client, config.globalSettings);
        res.send('window.config = ' + JSON.stringify(settings));
    },

    search: function(req, res) {
        // todo: implement smart global search
    }
}
