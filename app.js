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
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);


// Connection with MongoDB database through Mongoose 

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp'

mongoose.connect(dbUrl, 
	{useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongoose connected");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))


app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoStore({
	url: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
	console.log("session store error!", e)
})

// configuring session parameters

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000*60*60*24*7,
		maxAge: 1000*60*60*24*7
	}
}

// db sanitization for avoiding cross site scripting and db injections

app.use(mongoSanitize());


// Setting up configuration for Content Security Policy for Helmet

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net",
	"https://code.jquery.com/jquery-3.5.1.slim.min.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
	"https://use.fontawesome.com",
	"https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/p0b0yelp/", 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(session(sessionConfig));
app.use(flash());

// Setting up authentication

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Creating locals in the response object

app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

// Home route

app.get('/', (req, res)=>{
	res.render('home')
})

// Seting up routes that are handled through routes file

app.use('/campgrounds', campgroundRoutes);

app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', authRoutes);

// Error routes

app.all("*", (req, res, next)=>{
	next( new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next)=>{
	const {statusCode = 500} = err;
	if (!err.message){ err.message = "Oh no!, Something went wrong!"}
	res.status(statusCode).render('error', { err });
})


// Choosing development or production port and listening on it

const port = process.env.PORT || '3000'

app.listen(port, ()=>{
	console.log(`listening on port: ${port}` );
})