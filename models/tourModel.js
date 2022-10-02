const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'a tour name must not exceed 40 characters'],
            minlength: [10, 'a tour must have at least 10 characters'],
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must either easy,medium,or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1.0, 'rating must be above 1.0'],
            max: [5.0, 'rating must be below 1.0'],
            // setter function fire whenever we set a new value
            set: function (val) {
                return Math.round(val * 10) / 10;
            },
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'price discount({VALUE}) must be less than the price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            // hide it from the select query
            select: false,
        },
        startDates: [Date],
        slug: String,
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // geoJSON
            type: {
                type: 'String',
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: 'Point',
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
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

// virtual proporties (not actually stored in the database)
// we can calculate the duration weeks in the controller but we want to separate the bussiness logic and application as much as possible
tourSchema.virtual('durationInWeeks').get(function () {
    // this keyword point to the document
    return this.duration / 7;
});

// 1) Document MIDLLEWARE
// .save() .create() remove() a function will runs
// before saving the document to database
tourSchema.pre('save', function (next) {
    // this point to the current document
    this.slug = slugify(this.name, {
        replacement: '-', // replace spaces with replacement character, defaults to `-`
        lower: true, // convert to lower case, defaults to `false`
        trim: true,
    });
    next();
});

// after saving to database
// the doc variable has the final document in it
tourSchema.post('save', (doc, next) => {
    console.log(doc);
    next();
});

// 2) QUERY MIDLLWARE
tourSchema.pre(/^find/, function (next) {
    // this keyword point to the current query
    // not showing the secret tours
    //this.start = Date.now();
    this.find({ secretTour: { $ne: true } });
    next();
});

// how many time a query takes
tourSchema.post(/^find/, function (doc, next) {
    //console.log(`the query tooks ${Date().now() - this.start} ms`);
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});
// 3) AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function (next) {
    // pipeline is an array of stages objects
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});
 */
// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

tourSchema.index({ price: 1, ratingsAverage: 1 });
// on real earth
tourSchema.index({ startLocation: '2dsphere' });
// this is the model from which we can create  tour documents
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
