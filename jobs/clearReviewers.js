var Review           = require('../models/review'),
    notifier         = require('../services/notifier'),
    jobConfig        = config.jobs.clearReviewers,
    timerId          = -1;

module.exports = {

    startJob: function() {
        var that = this;

        // Try to run the job every 24hrs
        timerId = setInterval(function () {
            
            console.log('Starting Review Clear Job');

            var today = new Date();

            // Every saturday
            if (today.getDay() == 6) {

                Review.find({review_type: 'pullrequest'}, function(err, reviews) {
                    var topReview;

                    for (var i=0; i<reviews.length; i++) {

                        var review = reviews[i],
                            from;

                        // first time only
                        if (!review.weekly_data || !review.weekly_data.length) {
                            review.weekly_data = [];
                            from = new Date('April 01, 2014 12:00:00');
                        } else {
                            from = review.weekly_data[review.weekly_data.length - 1].to;
                        }

                        review.weekly_data.push({from: from, to: today, count: review.count});
                        review.prev_count = review.count;
                        review.count = 0;
                        review.save();

                        if (!topReview || review.prev_count > topReview.prev_count) {
                            topReview = review;
                        }
                    }

                    notifier.sendMessage(jobConfig.announcementRoom, 'Devflow', topReview.user.name + ' is reviewer of the week!', 'purple');
                });
            }
            
        }, 1000 * 60 * 60 * 24);
    },

    stopJob: function() {
        clearInterval(timerId);
    }
}
