var notifiers = {
    slack: require('./slack'),
    hipchat: require('./hipchat')
};

module.exports = {

    sendMessage: function(roomID, from, msg, color) {

        for (platform in notifiers) {
            notifiers[platform].sendMessage(roomID, from, msg, color);
        }
    },

    sendRoomsMessage: function(rooms, from, msg, color) {

        for (platform in rooms) {
            notifiers[platform].sendMessage(rooms[platform], from, msg, color);
        }
    }
}