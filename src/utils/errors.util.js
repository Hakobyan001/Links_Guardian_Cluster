const ERRORS_NAME = [
    'ExpiredEmailConfirmError',
    'ExpiredTokenConfirmError',
    'ConflictError',
    'Forbidden',
    'PermissionError',
    'InputValidationError',
    'InvalidEmailConfirmError',
    'InvalidPasswordError',
    'MicroserviceError',
    'UnauthorizedError',
    'ResourceNotFoundError'
];

const ErrorsUtil = ERRORS_NAME.reduce((acc, className) => {
    acc[className] = ({
        [className]: class extends Error {
            constructor(msg, status) {
                super();
                this.message = msg;
                this.status = status;
                this.name = className;
            }
        }
    })[className];
    return acc;
}, {});

module.exports = ErrorsUtil;





// module.exports = class InputValidationError extends Error {
//     status;
//     errors;
//     constructor(status,message, errors = []){
//         super(message)
//         this.status = status;
//         this.errors = errors
//     }
//      InputValidationError (message){
//         return new InputValidationError (400,message)
//     }
// } 
