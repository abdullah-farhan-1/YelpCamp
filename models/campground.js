const mongoose=require('mongoose')
const Review=require('./review.js')

const Schema=mongoose.Schema

//This will allow virtual properties to be passed on when our document gets converted to JSON. This is so that when we convert our campground documents to JSON for mapbox, we are able to pass on the virtual properties as well. 
const opts={ toJSON: { virtuals: true } };

const imageSchema=new Schema({
    url: {
        type: String
    },
    filename: {
        type: String
    },
})


//Virtual property to automatically adjust the image size in edit page to a width of 200px. 
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const campgroundSchema=new Schema({
    title: {
        type: String
    },
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)


//Virtual property to add the popupMarkup field to the properties object to be able to meet mapbox's requirement 
campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<p><strong><a href="/campgrounds/${this._id}">${this.title}</a></strong></p><p style="font-style: italic">${this.location}</p>`
})


//Mongoose Middleware function. This function will run whenever IF AND ONLY IF .findByIdAndDelete() function is executed inside app.js routes. With this middleware, we get access to the item we just deleted by passing that item as an argument inside the middleware
campgroundSchema.post('findOneAndDelete', async function (doc) {
    //console.log(doc) will display the item and its contents that were deleted
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Campground=mongoose.model('Campground', campgroundSchema)


module.exports=Campground