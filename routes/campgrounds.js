const express = require('express');
const router = express.Router();
const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const {storage} = require('../cloudinary/index');


const upload = multer({storage});



router.route("/")
    .get(catchError(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchError(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get( catchError(campgrounds.showCampground))
    .put( isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchError(campgrounds.updateCampground))
    .delete( catchError(campgrounds.deleteCampground));




router.get("/:id/edit", isLoggedIn, isAuthor, catchError(campgrounds.renderEditForm));



module.exports = router;
