const { body, validationResult, matchedData } = require('express-validator');

const CreatePlaceValidator = [
    body('title').isString().not().isEmpty(),
    body('address').isString().not().isEmpty(),
    body('image_base64').isString().not().isEmpty(),
    body('creator').isString().not().isEmpty(),
    body('description').isString().isLength({ min: 5 }),

    (request, response, next) => {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            return response.status(422).json({ success: false, errors: errors.array() });
        }

        request.body = matchedData(request, { locations: ['body'] });

        return next();
    },
];

module.exports = CreatePlaceValidator;
