const ApiError = require('../../exceptions/api-error');
const ErrorsUtil = require('./errors.util');
const HttpStatusCodesUtil = require('./http-status-codes.util');

const { ResourceNotFoundError } = ErrorsUtil;

module.exports = class SuccessHandlerUtil {
    static handleTokenVerification(response, next, result) {

        return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.OK, result);
    }

    /**
   * @param {Object} response
   * @param {number} status
   * @param {Object} [data]
   * @description Send response.
   */
    static _sendResponse(response, status, data) {
        response.status(status).json(data);
    }

    /**
   * @param {Object} res
   * @param {Function} next
   * @param {Array} result
   * @description Handle `list` type requests.
   */
    static handleList(res, next, result) {
        SuccessHandlerUtil._sendResponse(res, HttpStatusCodesUtil.OK, result);
    }

    /**
   * @param {Object} response
   * @param {Function} next
   * @param {Object} result
   * @description Handle 'add' type requests.
   */
    static handleAdd(response, next, result) {
        if (!result) {
            return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.NO_CONTENT);
        }

        return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.CREATED, result);
    }

    static handleDelete(response, next, result) {
        if (!result) {
            return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.NO_CONTENT);
        }

        return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.ACCEPTED, result);
    }
    
    /**
   * @param {Object} response
   * @param {Function} next
   * @param {Object} result
   * @description Handle `get` type requests.
   */
    static handleGet(response, next, result) {
        // console.log(result, "resssssssssssssssssssssssssssssssssssssss");

        if (!result) {
            return next(new ResourceNotFoundError('The specified resource is not found.'));
        }
        return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.OK, result);
    }

    /**
   * @param {Object} response
   * @param {Function} next
   * @param {Object} result
   * @description Handle `update` type requests.
   */
    static handleUpdate(response, next, result) {
        // console.log(result, "resssssssssssssssssssssssssssssssssssssss");

        if (!result) {
            return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.NO_CONTENT);
        }
        return SuccessHandlerUtil._sendResponse(response, HttpStatusCodesUtil.OK, result);
    }
}


// module.exports = SuccessHandlerUtil;



// module.exports = function (err, req, res, next) {
//     console.log(err);
//     if(err instanceof ApiError) {
//         return res.status(err.status).json({message: err.message, errors:err.errors})
//     }
//     return res.status(500).json({message:'Hello'})
// }