const { body, validationResult, matchedData, param } = require('express-validator');

const UpdatePlaceValidator = [
    param('id').isMongoId().not().isEmpty(),
    body('title').isString().not().isEmpty(),
    body('creator').optional().isMongoId().not().isEmpty(),
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

module.exports = UpdatePlaceValidator;
