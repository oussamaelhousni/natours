// contains all the express server stuffs
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const review = require('./../models/reviewModel');
const Review = require('./../models/reviewModel');

// mention the path of the environment file
dotenv.config({
    path: './../config.env',
});

// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then((con) => console.log('connection successful'));

const tours = JSON.parse(fs.readFileSync('./data/tours.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./data/reviews.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('documents deleted successfully');
        process.exit();
    } catch (err) {
        console.log('err');
    }
};

const importData = async () => {
    try {
        await User.create(users, { validateBeforeSave: false });
        await Tour.create(tours);
        await Review.create(reviews);
        console.log('data imported');
        process.exit();
    } catch (err) {
        console.log('error', err.message);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
