module.exports = {

    index: function(req, res) {
        if (!req.user) {
            res.redirect('/auth/google');
        } else {
            res.sendfile('public/views/index.html');
        }
    },

    config: function(req, res) {
    	res.send('window.config = ' + JSON.stringify(config.client));
    },

    search: function(req, res) {
        // todo: implement smart global search
    }
}
