//Part of the Controllers directory. We are following the MVC model. The Model-View-Controller (MVC) is an architectural pattern that separates an application into three main logical components: the model, the view, and the controller. Each of these components are built to handle specific development aspects of an application. 


const Campground=require('../models/campground.js')
const { cloudinary }=require('../cloudinary/index.js')
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN
const geocoder=mbxGeocoding({ accessToken: mapBoxToken }) // This is the Mapbox Geocoding API to convert addresses into coordinates (forward geocoding) or coordinates into addresses (reverse geocoding).


//Controller to display the index page for campgrounds
module.exports.index=async (req, res) => {
    const campgrounds=await Campground.find({})
    res.render('./campgrounds/index.ejs', { campgrounds })
}


//Controller to display the form for creating a new campground
module.exports.renderNewForm=(req, res) => {
    res.render('./campgrounds/new.ejs')
}


//Controller to create a new campground
module.exports.createCampground=async (req, res, next) => {
    const geoData=await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground=new Campground(req.body.campground)
    campground.geometry=geoData.body.features[0].geometry
    campground.images=req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author=req.user._id
    await campground.save()
    req.flash('success', 'Campground created!')
    res.redirect(`/campgrounds/${campground._id}`)
}


//Controller to display information about a specific campground
module.exports.showCampground=async (req, res) => {
    const campground=await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author') //This is an example of nested populate. We are populating all reviews from the reviews array on the campground we're finding. Further, we populate the author fields on each review. At the end, we populate the author field on the campground.
    if (!campground) {
        req.flash('error', 'Campground Not Found')
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/show.ejs', { campground })
}


//Controller to serve the edit form for campground
module.exports.renderEditForm=async (req, res) => {
    const id=req.params.id
    const campground=await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campground Not Found')
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/edit.ejs', { campground })
}


//Controller to edit a specific campground
module.exports.updateCampground=async (req, res, next) => {
    const id=req.params.id
    const campground=await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    campground.images.push(...req.files.map(f => (
        {
            url: f.path, filename: f.filename
        })
    ))
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Campground updated')
    res.redirect(`/campgrounds/${campground._id}`)
}


//Controller to delete a campground
module.exports.deleteCampground=async (req, res) => {
    const id=req.params.id
    const campground=await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted!')
    res.redirect('/campgrounds')
}