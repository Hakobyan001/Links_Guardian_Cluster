module.exports = class ApiError extends Error {
    status;
    errors;
    constructor(status,message, errors = []){
        super(message)
        this.status = status;
        this.errors = errors
    }
    static InputValidationError (message){
        return new ApiError(400,message)
    }
}
