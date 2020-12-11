const express = require('express');
const router = express.Router({mergeParams: true});
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware');
const reviews = require('../controllers/reviews');

const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const Review = require('../models/review'); 

router.post('/', isLoggedIn, validateReview, catchError(reviews.createReview));

router.delete('/:reviewId', isLoggedIn , isReviewAuthor, catchError(reviews.deleteReview));

module.exports = router;