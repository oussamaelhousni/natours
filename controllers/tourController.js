const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./factory');

// explanation : as we know an async function return a promise
// so if there was an error inside that promise it will be rejected and execute catch method
// catchAsync act like a wrapper to our function to get red of try and catch blocks
// the catchAsync fct will return a function that will excute our handler function

exports.getAllTours = factory.getAll(Tour);

exports.getTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findById(id).populate('reviews');
    if (!tour) {
        return next(new appError(`can't find a tour with this ID ${id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: tour,
        },
    });
});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lang] = latlng.split(',');
    if (!lat || !lang) {
        return next(
            new appError(
                'please provide latitude and langitude in the format lat,lang',
                400
            )
        );
    }

    // convert it to radians by deviding it by the radius of the earth
    const radius = unit === 'miles' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lang, lat], radius],
            },
        },
    });

    res.status(200).json({
        status: 'success',
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;

    const [lat, lang] = latlng.split(',');
    if (!lat || !lang) {
        return next(
            new appError(
                'please provide latitude and langitude in the format lat,lang',
                400
            )
        );
    }

    const multiplier = unit === 'miles' ? 0.00621371 : 0.001;
    // geoNear stage => first stage + index
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lang * 1, lat * 1],
                },
                distanceField: 'distance',
                // convert to meter
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: distances.length,
        data: {
            data: distances,
        },
    });
});

// we will assign this middleware before get all tour middleware
exports.top5Cheap = (req, res, next) => {
    req.query.sort = 'price,-ratingsAverage,';
    req.query.page = 1;
    req.query.limit = 5;
    next();
};

// just like aggregation in mongoDB
exports.getTourStats = catchAsync(async (req, res, next) => {
    console.log('from stats');
    const stats = await Tour.aggregate([
        {
            // the match we use the original fields
            $match: {
                ratingsAverage: { $gt: 4.7 },
            },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                difficultyPrice: { $sum: '$price' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: -1 },
        },
        {
            $match: { _id: { $ne: 'EASY' } },
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        // unwind split a document with array to multiple arguments
        {
            $unwind: '$startDates',
        },
        // just like filtering
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },

        {
            $group: {
                // extract the month from the date
                _id: { $month: '$startDates' },
                countTours: { $sum: 1 },
                // adding the group fields in an array
                tours: { $push: '$name' },
            },
        },
        {
            $sort: { countTours: -1 },
        },
        // adding new fields to the output
        {
            $addFields: { month: '$_id' },
        },
        // specifying the fields tha we want to show in the result
        {
            $project: {
                _id: 0,
            },
        },
        {
            $limit: 12,
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(
            new appError('Not an image,Please upload an image format', 400),
            false
        );
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 3,
    },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    console.log('first hi');
    // 1) image Cover
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;

    // 2 images
    req.body.images = [];
    const imageArray = req.files.images.map(async (file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${
            index + 1
        }.jpeg`;
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    });
    await Promise.all(imageArray);
    console.log(req.body, req.body.imageCover);
    next();
});
