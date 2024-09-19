const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users.js')


//Route to serve register form
router.get('/register', users.renderRegister)


//Route to create a user after registering
router.post('/register', catchAsync(users.register))


//Route to serve login form
router.get('/login', users.renderLogin)


//Route to submit the login form and login the user. To be able to use passport and automatically hash the password, check and validate the login credentials, we use the passport.authenticate() middleware. It basically does everything that we manually had to do using bcrypt. The first argument is the strategy we want to use, like local, facebook, twitter, google etc. We can also specify an options object. The failureFlash: true option flashes a message automatically if the user credentials fail. The failureRedirect: '/login' option will redirect us to '/login' if the user credentials don't pass the login stage. The code will move forward to req.flash() command if the credentials of the user pass the .authenticate() middleware.

//By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the session and deletes req.session.returnTo. This enables us to access and use the returnTo value (via res.locals.returnTo) later in the middleware chain so that we can redirect users to the appropriate page after they have logged in.

router.post('/login',

    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,

    // passport.authenticate logs the user in and clears req.session 
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),

    // Now we can use res.locals.returnTo to redirect the user after login, code present in users controller file
    users.login)


//Route to logout a user
router.get('/logout', users.logout)


module.exports = router