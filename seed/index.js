
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities.js');
const {descriptors, places} = require('./seedHelpers.js');

mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongoose connected");
});

const picker = (array) => array[ Math.floor(Math.random()*array.length) ];



const seedDB = async() => {
	await Campground.deleteMany({});
	for (i=0; i<50; i++) {
	const random = Math.floor(Math.random()*1000);
	const price = Math.floor(Math.random()*20+10);
	const camp = new Campground({
		location: `${cities[random].city} , ${cities[random].state}`, 
		name:`${picker(descriptors)} ${picker(places)}`, 
		price: price,
		image: "https://source.unsplash.com/collection/483251/1600x900" ,
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a blandit ligula. Aenean convallis eros nec felis porttitor ultricies. Aenean ipsum nisi, bibendum id risus nec, placerat interdum lectus. Curabitur finibus aliquet tellus, non tristique mauris cursus sed. Curabitur mattis gravida semper."	
	})
	await camp.save();
};
} 


// console.dir(cities);

seedDB().then(()=>{
	mongoose.connection.close();
})
