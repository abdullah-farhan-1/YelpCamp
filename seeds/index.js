const mongoose=require('mongoose')
const Campground=require('../models/campground')
const cities=require('./cities')
const { descriptors, places }=require('./seedHelpers')

const connection=async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log("Connected to the database")
    }
    catch (err) {
        console.log(err)
    }
}

connection()

const sample=array => {
    return array[Math.floor(Math.random()*array.length)]
}

const seedDB=async () => {
    await Campground.deleteMany({})
    for (let i=0; i<300; i++) {
        const random1000=Math.floor(Math.random()*1000)
        const price=Math.floor(Math.random()*30)+10;
        const randImg=Math.floor(Math.random()*400)+11;
        const camp=new Campground({
            author: '66db40659cedd94ae181252c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            images: [
                {
                    url: `https://picsum.photos/id/${randImg}/200/300`
                }
            ],
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure similique ipsum maxime numquam eum voluptates dicta alias molestias quia neque? Reprehenderit distinctio voluptatum deserunt totam velit similique optio voluptate inventore. Dicta alias inventore optio eaque laudantium eligendi corrupti, minima, nulla est molestiae, quisquam iure dolor corporis.',
            price: price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})