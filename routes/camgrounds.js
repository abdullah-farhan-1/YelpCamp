//Campground Route files

const express = require('express')
const router = express.Router()

const catchAsync = require('../utils/catchAsync')
const Review = require('../models/review.js')
const Campground = require('../models/campground.js')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js')
const campgrounds = require('../controllers/campgrounds.js')
const { storage } = require('../cloudinary/index.js')
const multer = require('multer') //This middleware will handle the multipart/form-data and parse files for us to make it accessible to the server. Multer adds a body object and a file (for single uploaded file) or files (for multiple uploaded files) object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
const upload = multer({ storage }) //Executes the multer middleware and accepts options. The dest specifies destination where the uploaded files will be uploaded. We can upload then to AWS/Cloudinary etc. as well as upload them on our local storage. Once executed, we can use the upload.single() and upload.array() methods to upload single or multiple images simultaneously. Once these mthods are called, multer will parse the multi-part/form-data and store file/files on req.file/req.files and store the other textual data on req.body. Also, we add a fieldname that should match whatever value is stored in the "name" attribute for the input="file" that we want to upload. This is what multer will look for and upload.

const dotenv = require('dotenv').config()


//Grouping routes with identical paths

router.route('/')
    //Route to display all campgrounds
    .get(catchAsync(campgrounds.index))

    //Route to create a new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


//Route to display form to create a new campground 
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    //Route to display information about a specific campground
    .get(catchAsync(campgrounds.showCampground))

    //Route to edit a specific campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

    //Route to delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));





//Route to serve edit campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router


//A hard-coded example on how to use multer to how to receive single and multiple files from our new.ejs HTML form and then be able to send and parse it on the server side
// router.route('/')
//     .post(upload.single('image'), (req, res) => {
//         console.log(req.body, req.file)
//         res.send('Ok')
//     })
//     .post(upload.array('image'), (req, res) => {
//         console.log(req.body, req.files)
//         res.send('Ok')
//     })