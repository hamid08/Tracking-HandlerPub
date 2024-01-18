const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');
const { tryCatch } = require('../common/utils/tryCatch');
const { json } = require('express');


router.post('/api/tracking/device/receive-data',
    tryCatch(
        async (req, res, next) => {
            await trackingService.HandleDeviceReceiveData(req.body);
            var result = OperationResult.SuccessfulOperation();
            res.status(201).send(result);

        })
);


router.post('/api/tracking/mobile/receive-data',
    tryCatch(
        async (req, res, next) => {
            await trackingService.HandleMobileReceiveData(req.body);
            var result = OperationResult.SuccessfulOperation();
            res.status(201).send(result);

        })
);

router.get('/api/tracking/get-all/:customerId',
    tryCatch(
        async (req, res, next) => {
            
            let customerId = req.params.customerId;
            const page = parseInt(req.query.page)
            const itemsPerPage = parseInt(req.query.itemsPerPage)
            
            var trackingList = await trackingService
            .GetAllTracking(customerId, page, itemsPerPage);
            
            var result = OperationResult.SuccessfulOperation(null,trackingList);

            res.status(201).send(result);

        })
);




module.exports = router;

