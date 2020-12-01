const express = require('express');
const router = express.Router({mergeParams: true});

const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const Review = require('../models/review'); 

router.post('/', catchError(async(req, res)=>{
	const {id} = req.params;
	const campground = await Campground.findById(id);
	const review = new Review(req.body.review);
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash('success', 'Created new review!')
	res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:reviewId', catchError(async(req, res)=>{
	const {id, reviewId} = req.params;
	await Campground.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Review deleted!')
	res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;