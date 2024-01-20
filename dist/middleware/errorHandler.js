"use strict";
const OperationResult = require('../common/OperationResult');
const errorHandler = (error, req, res, next) => {
    var result = OperationResult.FailedOperation(error.message, null);
    return res.status(400).send(result);
};
module.exports = errorHandler;
