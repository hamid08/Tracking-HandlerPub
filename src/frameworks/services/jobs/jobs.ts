import config from '../../../config/config'
import jobService from '../../../application/services/jobServcie';
import nodeCron from 'node-cron';


export default function jobManager() {
    var _jobService = jobService();

    const run = () => {

        // delete job
        nodeCron.schedule(config.jobs.delete_Cron, async () => {
            console.log(`*** Start Delete Job At ${new Date().toLocaleTimeString()}`);
            _jobService.DeleteTrackingData();
        })

        // resend job
        nodeCron.schedule(config.jobs.resend_Cron, async () => {
            console.log(`*** Start Resend Job At ${new Date().toLocaleTimeString()}`);
            _jobService.ResendTrackingData();
        })


    }

    return {
        run
    }

}