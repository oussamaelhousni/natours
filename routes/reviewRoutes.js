const express = require('express');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.setTouUserIds, reviewController.createReview);

router
    .route('/:id')
    .patch(reviewController.updateReview)
    .get(reviewController.getReview);

module.exports = router;
