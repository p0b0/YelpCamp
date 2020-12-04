const Campground = require('../models/campgrounds');

module.exports.index = async(req, res)=>{
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", {campgrounds});
};

module.exports.renderNewForm = (req, res, next)=>{
	res.render("campgrounds/new");
};

module.exports.createCampground = async(req, res, next)=>{
	
	const { campgrounds } = req.body;
	const campground = new Campground(campgrounds);
	campground.images = req.files.map(f => ({url: f.path , filename: f.filename}));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
	req.flash('success', 'You have successfully made a new campground!')
	res.redirect(`/campgrounds/${campground._id}`)
	
}

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

module.exports.updateCampground = async(req, res)=>{
	const {campgrounds} = req.body;
	const {id} = req.params;
	const campground = await Campground.findByIdAndUpdate(id,{ ...campgrounds} );
	req.flash('success', 'You have successfully updated your campground!')
	res.redirect(`${campground._id}`);
}

module.exports.deleteCampground = async(req, res)=>{
	const {id} = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground Deleted!')
	res.redirect("/campgrounds");
}