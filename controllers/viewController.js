const Tour = require('./../models/tourModel');
const User = require('../models/userModel.js');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find({});
    res.status(200).render('overview', {
        title: 'All tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'review user rating',
    });
    if (!tour) return next(new appError('No tour found !', 404));
    res.status(200).render('tour', {
        title: tour.name,
        tour,
    });
});

exports.account = (req, res) => {
    res.status(200).render('account', {
        title: 'Account',
    });
};

exports.login = (req, res) => {
    res.status(200).render('login', {
        title: 'Login',
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).render('account', {
        title: 'Account',
        user: updatedUser,
    });
});
