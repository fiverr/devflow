var jobs = [ require("./jobs/serverRelease"),
             require("./jobs/clearReviewers"),
             require("./jobs/timeNearlyUpReminder")];

for (var i = 0; i < jobs.length; i++) {
    jobs[i].startJob();
}
