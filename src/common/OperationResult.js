
function OperationResultFormat(success, message, data) {
    this.success = success;
    this.message = message;
    this.data = data;
}


function SuccessfulOperation(messages = null, data = null) {
    messages = messages == null ? "کاربر گرامی عملیات با موفقیت انجام شد." : messages;
    return new OperationResultFormat(true, messages,data);
}

function FailedOperation(messages = null, data = null) {
    messages = messages == null ? "کاربر گرامی عملیات با خطا مواجه شد." : messages;
    return new OperationResultFormat(false, messages,data);
}

module.exports = {
    SuccessfulOperation,
    FailedOperation

};