if (process.env.NODE_ENV!=='production') {
    const dotenv=require('dotenv').config()
} //This means that if we are in the development mode, or any mode other than production, then require dotenv package and store environment variables present in .env to process.env

const express=require('express')
const path=require('path')
const mongoose=require('mongoose')
const ejsMate=require('ejs-mate')
const catchAsync=require('./utils/catchAsync')
const { campgroundSchema, reviewSchema }=require('./schemas.js')
const ExpressError=require('./utils/ExpressError')
const Campground=require('./models/campground.js')
const Review=require('./models/review.js')
const User=require('./models/user.js')
const methodOverride=require('method-override')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport') //Allows us to plugin multiple strategies for authentication
const localStrategy=require('passport-local')
const mongoSanitize=require('express-mongo-sanitize'); //Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators. Without this sanitization, malicious users could send an object containing a $ operator, or including a ., which could change the context of a database operation. This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params, and then removes/replaces them. 
const helmet=require('helmet')
const MongoStore=require('connect-mongo')


const dbUrl='mongodb://127.0.0.1:27017/yelp-camp'
const connection=() => {
    try {
        mongoose.connect(dbUrl);
        console.log("Connected to the database")
    }
    catch (err) {
        console.log(err)
    }
}

connection()


const campgroundsRoutes=require('./routes/camgrounds.js')
const reviewsRoutes=require('./routes/reviews.js')
const usersRoutes=require('./routes/users.js')

const app=express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false })) //This enables all 11 middlewares that come with the helmet package but sets contentSecurityPolicy: false


//Below, we use the Mongo store to be able to store our session data in our database instead of the default behaviour where the session data was being saved in memory store
const store=MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24*60*60, //specifies time in seconds, tells the session to be updated once every 24 hours, irrespective of the number of requests made (with the exception of those requests which change something on the session data)
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
})

store.on('error', function (e) {
    console.log('Session Store Error', e)
})


const sessionConfig={
    store: store,
    name: 'session', //Sets the name of the cookie, instead of sesison.id which is default
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //Means the cookies set through the session are accessible over HTTP and not client-side JS, making it secure from XSS 
        expires: Date.now()+1000*60*60*24*7, //Sets expiration date of the sessionID cookie to one week, all these numbers are in miliseconds
        maxAge: 1000*60*60*24*7,
        //secure: true. This setting means that our cookie will work and configured over HTTPS only and not HTTP. Commented out because localhost is not secure, and hence this cookie will not work right now.
    }
}

app.use(session(sessionConfig))
app.use(flash())


//Below methods and middlewares are related to passport configuration

app.use(passport.initialize()) //This middleware is required in an Express app to initialize passport
app.use(passport.session()) //This middlware is required if our app uses login sessions, which it does. Also we need to use passport.session() after app.use(session(sessionConfig))
passport.use(new localStrategy(User.authenticate())) //We tell passport to use localStrategy (passport-local) and for the localStrategy, the authentication method is located on the User model and is called authenticate. Even though we did not make an authenticate method on the User model, it comes automatically from passport-local mongoose.
passport.serializeUser(User.serializeUser()) //This tells passport how to serialize a user, i.e. store a user in a session. This is another method added on the User model automatically by passport-local mongoose.
passport.deserializeUser(User.deserializeUser()) //This tells passport how to deserialize a user, i.e. remove a user from a session. This is another method added on the User model automatically by passport-local mongoose.



app.use((req, res, next) => {
    res.locals.currentUser=req.user //This will allow us to access currentUser in all our templates. Req.user is created by passport and will contain authenticated user's information
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})


app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', usersRoutes)


app.get('/', (req, res) => {
    res.render('home.ejs')
})


//A hard-coded example of how to use the .register() method provided by passport-local mongoose

app.get('/fakeuser', async (req, res) => {
    const user=new User({ email: 'abcd@gmail.com', username: 'abcdef' })
    const newUser=await User.register(user, 'qwerty')
    //The .register() method is provided by passport-local mongoose. It accepts a user document and the password the user enters. It will automatically hash and then register a new user instance with the given password, also checks if username is unique. It also automatically adds the salt and the hash fields to the resulting newUser document, and saves it to the database without having to explicitly use await newUser.save()
    res.send(newUser)
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode=500 }=err
    if (!err.message) {
        err.message='Something Went Wrong'
    }
    res.status(statusCode).render('./error.ejs', { err })
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})