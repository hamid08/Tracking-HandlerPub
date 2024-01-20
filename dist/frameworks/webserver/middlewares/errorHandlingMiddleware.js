"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
function errorHandlingMiddlware(err, req, res, next) {
    err.statusCode = err.statusCode || 404;
    return err.customMessage || err.message
        ? res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.customMessage || err.message
        })
        : res.status(err.statusCode).json({ status: err.statusCode, message: err });
}
exports.default = errorHandlingMiddlware;
