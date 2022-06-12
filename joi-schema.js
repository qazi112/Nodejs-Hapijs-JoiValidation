const Joi = require("joi")

const id = Joi.string().guid({ version: "uuidv4" })

const name = Joi.string().regex(/^[A-Z]+$/).uppercase()

const ageSchema = Joi.number().integer().greater(6).required()

const personDataSchema = Joi.object().keys({
    _id: id.required(),
    firstname: name,
    lastname: name,
    fullname: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
    type: Joi.string().valid('STUDENT', 'TEACHER').uppercase().required(),

    age: Joi.when('type', {
        is: 'STUDENT',
        then: ageSchema.required(),
        otherwise: ageSchema
    })
})


module.exports = {personDataSchema}