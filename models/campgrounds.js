const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
	name: String,
	price: Number,
	images:[{
		url: String,
		filename: String
	}],
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	reviews: [{
		type: Schema.Types.ObjectId, 
		ref : "Review"
	}]

});

campgroundSchema.post('findOneAndDelete', async function(doc){
	if(doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews}
		})
	}
})

module.exports = mongoose.model('Campground', campgroundSchema);