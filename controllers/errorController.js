const appError = require('./../utils/appError');
// separate the production and develoepemnt envirements
const handleCastleErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new appError(message, 400);
};

const handleDuplicateFieldsErrorDB = (err) => {
    // const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate fields values "${
        Object.values(err.keyValue)[0]
    }",Please enter another value !`;
    return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data, ${errors.join('. ')}`;
    return new appError(message, 400);
};

const handleJwtError = (err) => {
    const message = 'Invalid Token';
    return new appError(message, 400);
};

const handleJwtExpiredToken = (err) => {
    return new appError(`Your token has expired Please Login again`, 401);
};
const sendErrorDev = (err, req, res) => {
    if (!req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message,
            status: err.status,
        });
    } else {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
};

const sendErrorProd = (err, req, res) => {
    // error in the api
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            // trusted Error:end message to client
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'something went wrong',
            });
        }
    }
    //
    if (err.isOperational) {
        // trusted Error:end message to client
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message,
        });
    } else {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: 'Something went wrong',
        });
    }
};

module.exports = (err, req, res, next) => {
    // unknown errors
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError') error = handleCastleErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsErrorDB(error);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJwtError(error);
        if (err.name === 'TokenExpiredError')
            error = handleJwtExpiredToken(error);
        sendErrorProd(error, req, res);
    }
};
