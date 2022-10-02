const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

// define a router for tours
const router = express.Router();
// router.param('id', tourController.checkID);
// alias
router
    .route('/top-5-cheap')
    .get(tourController.top5Cheap, tourController.getAllTours);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/stats').get(tourController.getTourStats);

router.route('/monthlyplan/:year').get(tourController.monthlyPlan);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(tourController.deleteTour);

router.route('/:tourId/reviews').post();
// exporting the tour router for assigning the path to it in the app file
module.exports = router;
