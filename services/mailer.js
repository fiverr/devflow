var nodemailer    = require('nodemailer'),
    serviceConfig = config.mail,
    smtpTransport = nodemailer.createTransport('SMTP', serviceConfig);

module.exports = {

    sendMail: function(to, subject, body, forceSend) {

        if (serviceConfig.isEnabled || forceSend) {

            var mailOptions = {
                from: serviceConfig.from,
                to: to, 
                subject: subject,
                html: body + '<br><br><br>' + serviceConfig.signature
            }

            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Message sent: ' + response.message);
                }
            });
        }
    }
}
