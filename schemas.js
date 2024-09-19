const BaseJoi=require('joi')
const { validate }=require('./models/review')
const sanitizeHtml=require('sanitize-html')

//JOI validation schema, validates if req.body contains all the needed data


//This defines a custom Joi extension for a string type that adds a rule to prevent HTML injection by sanitizing input using the sanitizeHtml function.
//Joi Extension: You are extending the string type to add a new validation rule called escapeHTML.
//Validation Rule: The escapeHTML rule sanitizes the string input to strip any HTML tags using sanitizeHtml. If the cleaned string differs from the original, it throws an error, preventing HTML in the input.
const extension=(joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean=sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                if (clean!==value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }

})


const Joi=BaseJoi.extend(extension)


module.exports.campgroundSchema=Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})


module.exports.reviewSchema=Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})