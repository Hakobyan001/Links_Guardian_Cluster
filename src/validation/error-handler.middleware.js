const http =  require('http');

const  HTTP_STATUS_CODES  = require('../utils/http-status-codes.util');

class ErrorHandlerMiddleware {
  /**
   * @param {Object} error
   * @param {Object} request
   * @param {Object} response
   * @param {Function} next
   * @description Initialize error handler.
   */
  static init(error, request, response, next) {
    const ERROR_CASE = ErrorHandlerMiddleware.ERROR_CASES[error.status]
      || ErrorHandlerMiddleware.ERROR_CASES[error.code]
      || ErrorHandlerMiddleware.ERROR_CASES[error.name]
      || ErrorHandlerMiddleware.ERROR_CASES.DEFAULT;

    const { status, code, message } = ERROR_CASE;

    const result = {
      status, code, message: message || error.message, data: error.data
    };

    if (result.status === 500) {
      console.log('Case: ', error.status, error.code, error.name, error.message);
    }
    if (result.status >= 500) console.log(error);

    response.status(result.status).json(result);
  }
}

ErrorHandlerMiddleware.ERROR_CASES = {
  400: { // microservice, error status is used
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  ExpiredTokenConfirmError: {
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  ExpiredEmailConfirmError: {
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  InputValidationError: {
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  InvalidEmailConfirmError: {
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  InvalidPasswordError: {
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  SyntaxError: { // body-parser
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  11000: { // mongodb
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST],
    message: 'Duplicate entry.'
  },
  DocumentNotFoundError: { // mongodb
    status: HTTP_STATUS_CODES.NOT_FOUND,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.NOT_FOUND],
    message: 'Document Not Found.'
  },
  CastError: { // mongodb
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  ValidationError: { // mongodb
    status: HTTP_STATUS_CODES.BAD_REQUEST,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.BAD_REQUEST]
  },
  401: { // microservice, error status is used
    status: HTTP_STATUS_CODES.UNAUTHORIZED,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.UNAUTHORIZED]
  },
  UnauthorizedError: {
    status: HTTP_STATUS_CODES.UNAUTHORIZED,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.UNAUTHORIZED]
  },
  Forbidden: {
    status: HTTP_STATUS_CODES.FORBIDDEN,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.FORBIDDEN]
  },
  ForbiddenError: {
    status: HTTP_STATUS_CODES.FORBIDDEN,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.FORBIDDEN]
  },
  PermissionError: {
    status: HTTP_STATUS_CODES.FORBIDDEN,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.FORBIDDEN]
  },
  404: { // microservice, error status is used
    status: HTTP_STATUS_CODES.NOT_FOUND,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.NOT_FOUND]
  },
  ResourceNotFoundError: {
    status: HTTP_STATUS_CODES.NOT_FOUND,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.NOT_FOUND]
  },
  ConflictError: {
    status: HTTP_STATUS_CODES.CONFLICT,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.CONFLICT]
  },
  MicroserviceError: {
    status: HTTP_STATUS_CODES.FAILED_DEPENDENCY,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.FAILED_DEPENDENCY]
  },
  DEFAULT: {
    status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    code: http.STATUS_CODES[HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR],
    message: 'The server encountered an internal error. Try again later.'
  }
};
module.exports = ErrorHandlerMiddleware