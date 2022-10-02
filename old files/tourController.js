const fs = require('fs');
const Tour = require('./../models/tourModel');
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
};

exports.getTour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find((e) => e.id === id * 1);
    //   if (tours.length < id * 1) {
    //   if (!tour) {
    //     res.status(404).json({
    //       status: 'fail',
    //       message: 'invalid id',
    //     });
    //   }
    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

exports.createTour = (req, res) => {
    exports.newId = tours[tours.length - 1].id + 1;
    console.log(req.body);
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        () => {
            res.status(201).json({
                status: 'succes',
                data: {
                    newTour,
                },
            });
        }
    );
};

exports.patchTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Updating Tour',
        },
    });
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null,
    });
};

exports.checkID = (req, res, next, val) => {
    if (val * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid Id',
        });
    }
};
