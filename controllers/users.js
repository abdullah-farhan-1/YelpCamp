const User = require('../models/user')


//Controller to serve the register user form
module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs')
}


//Controller to submit the form data to register a user
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username: username, email: email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) {
                return next(err)
            } else {
                req.flash('success', 'Welcome to YelpCamp!')
                res.redirect('/campgrounds')
            }
        })
    } //This will automatically login the user that just registered themselves. Otherwise without this, the user will manually have to login using the login form. When the login operation completes, user will be assigned to req.user. Also, passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}


//Controller to serve the login form
module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs')
}


//Controller to login a user using passport
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}


//Controller to logout a user
module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged out successfully')
        res.redirect('/campgrounds')
    })
}