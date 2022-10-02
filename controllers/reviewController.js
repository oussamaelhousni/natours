const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

// get all the reviews handler
exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({});

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

exports.setTouUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
};
// create a new review
exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    const review = await Review.findOneAndUpdate(req.params.id, req.body);
    console.log('second hi');
    if (!review) {
        return next(
            new appError(`can't find a review with this ID ${id}`, 404)
        );
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: review,
        },
    });
});

exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(
            new appError(`can't find a review with this ID ${id}`, 404)
        );
    }
    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});
