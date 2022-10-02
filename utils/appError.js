class appError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        // search for it
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;
