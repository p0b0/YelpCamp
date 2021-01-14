const Joi = require('joi');

// Setting up constraints for data that we accept to be stored in the db

module.exports.campgroundSchemaValidator = Joi.object({
    campgrounds: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        location: Joi.string().required()
    }).required() ,
    deleteImages: Joi.array()
    
})

module.exports.reviewSchemaValidator = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    })
})

