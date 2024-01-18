const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    name: Joi.string().min(5).max(10).required()
        .label('نام')
        .messages({
            'string.base': '{#label} باید یک رشته باشد',
            'string.empty': '{#label} نمی تواند خالی باشد',
            'string.min': '{#label} باید حداقل {#limit} نویسه داشته باشد',
            'string.max': 'طول {#label} باید کمتر یا برابر با {#limit} نویسه باشد',
            'any.required': '{#label} یک فیلد الزامی است'
        }),

    // age: Joi.number().integer().min(18).max(60).required().messages({
    //     'number.base': '{#label} must be a number',
    //     'number.empty': '{#label} is not allowed to be empty',
    //     'number.integer': '{#label} must be an integer',
    //     'number.min': '{#label} must be greater than or equal to {#limit}',
    //     'number.max': '{#label} must be less than or equal to {#limit}',
    //     'any.required': '{#label} is a required field'
    // }),

    email: Joi.string().email().lowercase().required()
        .label('ایمیل')
        .messages({
            'string.base': '{#label} باید یک رشته باشد',
            'string.empty': '{#label} نمی تواند خالی باشد',
            'string.min': '{#label} باید حداقل {#limit} نویسه داشته باشد',
            'string.max': 'طول {#label} باید کمتر یا برابر با {#limit} نویسه باشد',
            'any.required': '{#label} یک فیلد الزامی است'
        }),


    password: Joi.string().min(2).required()
        .label('رمز عبور')
        .messages({
            'string.base': '{#label} باید یک رشته باشد',
            'string.empty': '{#label} نمی تواند خالی باشد',
            'string.min': '{#label} باید حداقل {#limit} نویسه داشته باشد',
            'string.max': 'طول {#label} باید کمتر یا برابر با {#limit} نویسه باشد',
            'any.required': '{#label} یک فیلد الزامی است'
        }),
})

module.exports = {
    authSchema,
}
