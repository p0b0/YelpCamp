const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const catchError = require('./utils/catchError');
const ExpressError = require('./utils/ExpressError');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const Review = require('./models/review'); 
const methodOverride = require('method-override');
// const bodyParser = require('body-parser')
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');


mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongoose connected");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
// app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000*60*60*24*7,
		maxAge: 1000*60*60*24*7
	}
}



app.use(session(sessionConfig));
app.use(flash());

app.get('/', (req, res)=>{
	res.send('HOME')
})

app.use((req, res, next)=>{
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

app.use('/campgrounds', campgrounds);

app.use('/campgrounds/:id/reviews', reviews);

app.all("*", (req, res, next)=>{
	next( new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next)=>{
	const {statusCode = 500} = err;
	if (!err.message){ err.message = "Oh no!, Something went wrong!"}
	res.status(statusCode).render('error', { err });
})



app.listen(3000, ()=>{
	console.log("listening on 3000");
})