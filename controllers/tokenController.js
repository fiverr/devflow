jwt = require('jsonwebtoken');

module.exports = {
    generate: function(req, res) {
        if (!req.user) {
            res.redirect('/auth/google');
            return;
        }

        console.error("token generate");
        var token = jwt.sign(req.user, req.app.get('superSecret'), {
            expiresIn: "150d"
        });

        res.json({
            token: token
        });
    }
}

