const ErrorResponseBuilder = require('../helper/error-response-builder.helper');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

const jwtProtect = async (request, response, next) => {
    let request_token;

    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
        request_token = request.headers.authorization.split(' ')[1];
    }

    if (!request_token) {
        return next(new ErrorResponseBuilder('Not authorized to access this route', 401));
    }

    try {
        const decoded_request_token = jwt.verify(request_token, process.env.JWT_SECRET_KEY);

        const request_user = await User.findById(decoded_request_token._id);

        if (!request_user) {
            return next(new ErrorResponseBuilder('User not found', 404));
        }

        request.user = request_user;

        next();
    } catch (error) {
        return next(new ErrorResponseBuilder('Invalid token', 401));
    }
};

module.exports = { jwtProtect };
