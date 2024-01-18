const trackingRoutes = require('./controllers/trackingController');



function RegisterAllRoutes(app) {

    app.use(trackingRoutes)

}

module.exports = {
    RegisterAllRoutes: RegisterAllRoutes
};






