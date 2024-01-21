import config from '../../../config/config'


export default function jobManager(nodeCron: any) {

    const run = () => {

        // delete job
        nodeCron.schedule(config.jobs.delete_Cron, async () => {
            console.log(`*** Run Delete Job At ${new Date().toLocaleTimeString()}`);
        })

        // resend job
        nodeCron.schedule(config.jobs.resend_Cron, async () => {
            console.log(`*** Run Resend Job At ${new Date().toLocaleTimeString()}`);
        })


    }

    return {
        run
    }

}