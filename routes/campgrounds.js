const express = require('express');
const router = express.Router();
const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash');
 


router.get("/" , catchError(async(req, res)=>{
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", {campgrounds});
}))

router.post("/", catchError(async(req,res, next)=>{
	
	const { campgrounds } = req.body; 
	console.log(campgrounds);
	const campground = new Campground(campgrounds);
	await campground.save();
	req.flash('success', 'You have successfully made a new campground!')
	res.redirect(`/campgrounds/${campground._id}`)
	
}))

router.get("/new", (req,res)=>{
	res.render("campgrounds/new");
})

router.get("/:id", catchError(async(req, res)=>{
	const {id}=req.params;
	const campground = await Campground.findById(id).populate('reviews');
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		res.redirect('/campgrounds')
	} else {
	res.render("campgrounds/show", {campground});
	}
}))

router.get("/:id/edit", catchError(async(req, res)=>{
	const {id} = req.params;
	console.log(id);
	const campground = await Campground.findById(id);
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		res.redirect('/campgrounds')
	} else {
	res.render("campgrounds/edit", { campground });
	}
}))

router.put("/:id", catchError(async(req, res)=>{
	const {campgrounds} = req.body;
	const {id} = req.params;
	console.log(campgrounds, id);
	const campground = await Campground.findByIdAndUpdate(id,{ ...campgrounds} );
	console.log(campground)
	req.flash('success', 'You have successfully updated your campground!')
	res.redirect(`${campground._id}`);
	
}))

router.delete("/:id", catchError(async(req, res)=>{
	const {id} = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground Deleted!')
	res.redirect("/campgrounds");
}))

module.exports = router;
