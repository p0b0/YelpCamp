const express = require('express');
const router = express.Router();
const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash');
const { isLoggedIn, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const {storage} = require('../cloudinary/index');

const upload = multer({storage});



router.route("/")
    .get(catchError(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), catchError(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get( catchError(campgrounds.showCampground))
    .put( isLoggedIn, isAuthor, catchError(campgrounds.updateCampground))
    .delete( catchError(campgrounds.deleteCampground));




router.get("/:id/edit", isLoggedIn, isAuthor, catchError(campgrounds.renderEditForm));



module.exports = router;
