const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})


//We only defined email in the userSchema, although we should've defined the username and password as well. Passport-Local Mongoose in the command below will automatically add a username, hash and salt field to store the username, the hashed password and the salt value. It'll itself make sure the usernames are unique as well as give us some additional methods to the schema, one of which is .authenticate() used in app.js

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

module.exports = User