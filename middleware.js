const Campground = require('./models/campground.js')
const Review = require('./models/review.js')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')




//.isAuthenticated() is a helper method provided by passport and is added to the request object itself. It will check if the user is authenticated or not.
const isLoggedIn = (req, res, next) => {
    //console.log(req.user) req.user contains information about the user thats currently loggen in. The req.user is a property in Express.js that is populated by Passport.js once a user is authenticated. We can access it directly as req.user to retrieve the authenticated user's information.
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first')
        return res.redirect('/login')
    }
    next()
}


//This middleware will be used to save the returnTo value from the session (req.session.returnTo) to res.locals
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


//middleware functions to validate all the fields are included in the req.body when form submission

const validateCampground = (req, res, next) => {
    //JOI validation schema, validates if req.body contains all the needed data for campground form submission
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


//This middleware will be used to check is user is the owner of the campground or not.
const isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


//This middleware will be used to check is user is the owner of the campground or not.
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params
    const review = await Review.findById(reviewID)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//middleware functions to validate all the fields are included in the req.body when form submission
const validateReview = (req, res, next) => {
    //JOI validation schema, validates if req.body contains all the needed data for review form submission
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports = {
    isLoggedIn,
    storeReturnTo,
    validateCampground,
    isAuthor,
    validateReview,
    isReviewAuthor
};