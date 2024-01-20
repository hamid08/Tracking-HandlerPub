const OperationResult = require('../common/OperationResult');

const errorHandler = (error:any, req:any, res:any, next:any) => {
    var result = OperationResult.FailedOperation(error.message,null);

    return res.status(400).send(result);
};

module.exports = errorHandler;