//Review Route files

const express = require('express')
const router = express.Router({ mergeParams: true }) //merges the params from app.js and reviews.js. Since we have defined params in app.js as ":id" here in app.use('/campgrounds/:id/reviews', reviewRouter), we need to use mergeParams to be able to pass on the params to this file

const catchAsync = require('../utils/catchAsync')
const { campgroundSchema, reviewSchema } = require('../schemas.js')
const Review = require('../models/review.js')
const Campground = require('../models/campground.js')
const ExpressError = require('../utils/ExpressError')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js')
const reviews = require('../controllers/reviews.js')


//Route to submit the review form data for a particular campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))


//Route to delete a particular review from a particular campground
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router