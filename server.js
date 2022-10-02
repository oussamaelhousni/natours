// contains all the express server stuffs
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// mention the path of the environment file
dotenv.config({
    path: './config.env',
});

const app = require('./app');

// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
const DB = process.env.DATABASE_LOCAL;
mongoose
    .connect(DB)
    .then((con) => console.log('successful Connection To DB'))
    .catch((err) => {
        console.log('error happen in connecting to database');
        process.exit(1);
    });

// specifying the port number
const port = process.env.PORT || 8080;

// The server start listening for requests
const server = app.listen(port, () => {
    console.log(`start listening on ${port} ..`);
});

// per example not catching an rejected promise
process.on('unhandledRejection', () => {
    console.log('error unhandled rejection');
    server.close(() => {
        process.exit(1);
    });
});

// per example using undeclared variable
// this code should be at the top before the exception occur
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION');
    console.log(err);
    process.exit(1);
});
