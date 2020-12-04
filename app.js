if(process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

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
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');


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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res)=>{
	res.send('HOME')
})

app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

app.use('/campgrounds', campgroundRoutes);

app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', authRoutes);

app.get('/fakeUser', async (req, res)=>{
	const user = new User({ email: 'blablabla@gmail.com', username: 'slobroyo'})
	const newUser = await User.register(user, 'chicken')
	res.send(newUser);
})

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