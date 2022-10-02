const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review //rating //createdAt // ref to userModel // ref to tourModel

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: 'String',
            required: [true, 'Review can not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour'],
        },
    },
    {
        // show the virtual fields when we return json from DB
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

reviewSchema.statics.calcStats = async function (tourId) {
    //this in here point to the Model it self
    console.log('before stats', tourId);
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId,
            },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    return await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating,
    });
};

// update the average rating after saving
reviewSchema.post('save', function () {
    console.log('this', this);
    // this point to the current docuemnt
    this.constructor.calcStats(this.tour);
});

// update rating after update and delete
// pass the document to the post middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne().clone();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    console.log(await this.r.constructor.calcStats(this.r.tour));
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
