var jobs = [ require("./jobs/serverRelease"),
             require("./jobs/clearReviewers")];

for (var i = 0; i < jobs.length; i++) {
    jobs[i].startJob();
}
