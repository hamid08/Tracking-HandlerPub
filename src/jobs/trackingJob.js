const nodeCron = require('node-cron');
const TrackingService = require("../services/trackingService");


//#region  JobCronsTime

// 1- '*/5 * * * *' => This job will run every 5 min

// 2- '* * * * * *' => This job will run every second

//#endregion


nodeCron.schedule(process.env.JobCron,async () => {
    await TrackingService.HandleTrackingJob();

    console.log(`Job Run ${new Date().toLocaleTimeString()}`);
})
