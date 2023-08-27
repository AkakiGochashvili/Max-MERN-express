const { body, validationResult, matchedData } = require('express-validator');

const LoginValidator = [

    body('email')
        .isString()
        .not()
        .isEmpty()
        .matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),


    body('password').isString().isLength({ min: 6 }),

    (request, response, next) => {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            return response.status(422).json({ success: false, errors: errors.array() });
        }

        request.body = matchedData(request, { locations: ['body'] });

        return next();
    },
];

module.exports = LoginValidator;
