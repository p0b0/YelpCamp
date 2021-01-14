const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

// Showing all Campgrounds

module.exports.index = async(req, res)=>{
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", {campgrounds});
};

// Rendering form for creating a new Campground

module.exports.renderNewForm = (req, res, next)=>{
	res.render("campgrounds/new");
};

// Creation of a new Campground

module.exports.createCampground = async(req, res, next)=>{
	
	const geoData = await geocoder.forwardGeocode({
		query:req.body.campgrounds.location,
		limit: 1
	}).send();

	const campground = new Campground(req.body.campgrounds);
	campground.geometry = geoData.body.features[0].geometry
	campground.images = req.files.map(f => ({url: f.path , filename: f.filename}));
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'You have successfully made a new campground!')
	res.redirect(`/campgrounds/${campground._id}`)
	
}

// Showing a specific Campground

module.exports.showCampground = async(req, res)=>{
	const {id}=req.params;
	const campground = await Campground.findById(id).populate({path: 'reviews', populate:{path: 'author'} }).populate('author');
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		res.redirect('/campgrounds')
	} else {
	res.render("campgrounds/show", {campground});
	}
}


// Rendering form for editing an existing Campground

module.exports.renderEditForm = async(req, res)=>{
	const {id} = req.params;
	const campground = await Campground.findById(id);
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		res.redirect('/campgrounds')
	} else {
	res.render("campgrounds/edit", { campground });
	}
}

// Process for updating an existing Campground

module.exports.updateCampground = async(req, res)=>{
	const {campgrounds} = req.body;
	const {id} = req.params;
	const campground = await Campground.findByIdAndUpdate(id,{ ...campgrounds} );
	const imgs = req.files.map(f => ({url: f.path , filename: f.filename}));
	campground.images.push(... imgs); 
	await campground.save();
	if (req.body.deleteImage) {
		for (let filename of req.body.deleteImage) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImage}}}})
	}
	req.flash('success', 'You have successfully updated your campground!')
	res.redirect(`${campground._id}`);
}

// Deleting a Campground

module.exports.deleteCampground = async(req, res)=>{
	const {id} = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground Deleted!')
	res.redirect("/campgrounds");
}