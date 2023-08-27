const { body, validationResult, matchedData } = require('express-validator');
const User = require('../../model/user.model');

const SignupValidator = [
    body('name').isString().not().isEmpty(),

    body('image_base64').optional().isString().not().isEmpty(),

    body('email')
        .isString()
        .not()
        .isEmpty()
        .matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
        .custom(async (value) => {
            return await User.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            });
        }),

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

module.exports = SignupValidator;
