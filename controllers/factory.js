const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(
                new appError(`can''t find a document with this ID ${id}`, 404)
            );
        }
        res.status(204).json({
            status: 'success',
            message: 'deleted successfully',
        });
    });

// Do not update the password with this
exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(
                new appError(`can't find a document with this ID ${id}`, 404)
            );
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, populateOption) =>
    (getTour = catchAsync(async (req, res, next) => {
        let query = await Model.findById(req.params.id);
        if (populateOption) query = query.populate(populateOption);
        const doc = await query;

        // if a valid id entered mongoose may not produce an error and return an empty object instead
        if (!doc) {
            return next(
                new appError(`can't find a doc with this ID ${id}`, 404)
            );
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    }));

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const featuresApi = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate().query;
        // EXECUTE THE QUERY
        const docs = await featuresApi;
        // SEND THE RESPONSE
        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs,
            },
        });
    });
