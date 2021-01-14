const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const {campgroundSchemaValidator, reviewSchemaValidator} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');

// Middleware used in routes for checking if a user is logged in

module.exports.isLoggedIn = (req, res, next) => {
    console.log("req.user:", req.user);
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
}

// Middleware used in routes for checking if a user is the creator of the content "Campgrounds"

module.exports.isAuthor = async(req, res, next)=>{
	const {id} = req.params;
	const checkcamp = await Campground.findById(id);
	if (!checkcamp.author.equals(req.user._id)) {
		req.flash('error', "You do not have that permission!")
		res.redirect(`/campgrounds/${id}`);
	} else {
		next();}
}

// Middleware used in routes for checking if a user is the creator of the content "Reviews"

module.exports.isReviewAuthor = async(req, res, next)=>{
	const {id, reviewId} = req.params;
	const checkreview = await Review.findById(reviewId);
	if (!checkreview.author.equals(req.user._id)) {
		req.flash('error', "You do not have that permission!")
		res.redirect(`/campgrounds/${id}`);
	} else {
		next();}
}
 
// Joi validation for data that will be stored in the db for content "Campground"

module.exports.validateCampground = (req, res, next)=>{
	
	const {error} = campgroundSchemaValidator.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}

// Joi validation for data that will be stored in the db for content "Reviews"

module.exports.validateReview = (req, res, next)=>{
	const {error} = reviewSchemaValidator.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}
