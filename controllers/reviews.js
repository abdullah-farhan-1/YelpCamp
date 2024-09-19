const Review = require('../models/review.js')
const Campground = require('../models/campground.js')



//Controller to submit review's form data to create a review for a campground
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success', 'Review added!')
    res.redirect(`/campgrounds/${campground._id}`)
}


//Controller for deleting a review on a campground
module.exports.deleteReview = async (req, res) => {
    const { id, reviewID } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    req.flash('success', 'Review deleted!')
    res.redirect(`/campgrounds/${id}`)
}