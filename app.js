// this app file contains express stuffs and middlewares
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const appError = require('./utils/appError');
const globalErrorhandler = require('./controllers/errorController');

// import the routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Security

// limit the number of request per ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests,Please try again in one hour!',
});

// set security headers
app.use(helmet());

// Data sanitization against no sql query Injection
app.use(mongoSanitize());
// Data sanitization against xss Injection
app.use(xss());
// prevent paramter pollution
app.use(
    hpp({
        whitelist: ['duration'],
    })
);
app.use('/api', limiter);
// show the body in the request
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// serve the static files (html,css,js)
app.use(express.static(path.join(__dirname, 'public')));

// 2) ROUTING
// assigning a route to each router,then the router will handle the requests
app.use('', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// all the other routes that we are not specifying
// the order of this middleware is so important it should come after all the middlewares
app.all('*', (req, res, next) => {
    // jump directly to global error handler
    next(
        new appError(`cant't find this ${req.originalUrl} on the server`, 404)
    );
});

// global middleware handler
app.use(globalErrorhandler);

module.exports = app;
