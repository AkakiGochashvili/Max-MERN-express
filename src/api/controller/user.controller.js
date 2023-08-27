const User = require('../model/user.model');
const ErrorResponseBuilder = require('../helper/error-response-builder.helper');
const cloudinary = require('../util/cloudinary');

// @desc        Registration
// @route       POST /api/users/signup
// @access      Public
exports.signup = async (request, response, next) => {
    let user = await User
        .create({ ...request.body })
        .catch((error) => {
            return next(new ErrorResponseBuilder(error.message, 500));
        });

    if (request.body.image_base64) {
        let image

        await cloudinary.uploader
            .upload(request.body.image_base64, {
                public_id: `${user._id}`,
                upload_preset: "MERN-stack-users-profile-images",
                width: 400,
                height: 400,
                gravity: "faces",
                crop: "thumb"
            })
            .then((result) => {
                image = result.secure_url
            }).catch(async (error) => {
                await User.findByIdAndDelete(user._id)
                return next(
                    new ErrorResponseBuilder(`The user profile image could not be uploaded to the cloud`, 400)
                )
            });

        await User
            .findByIdAndUpdate(user._id, { image }, {
                runValidators: true,
                new: true
            })
            .then(updated_user => {

                const access_token = user.getJwt();

                response.status(201).json({ success: true, access_token: access_token, email: updated_user.email, userId: updated_user._id });
            })
            .catch(async error => {
                await User.findByIdAndDelete(user._id)
                return next(
                    new ErrorResponseBuilder(`The user profile image could not be uploaded to the Cloud`, 400)
                )
            })
    } else {
        const access_token = user.getJwt();

        response.status(201).json({ success: true, access_token: access_token, email: user.email, userId: user._id });
    }



};

// @desc        Login
// @route       POST /api/users/login
// @access      Public
exports.login = async (request, response, next) => {
    try {
        const user = await User.findOne({ email: request.body.email });

        if (!user) {
            return next(
                new ErrorResponseBuilder(
                    `The user could not be found with the specified email: ${request.body.email}`,
                    404
                )
            );
        }

        const is_match = await user.matchPassword(request.body.password);

        if (!is_match) {
            return next(new ErrorResponseBuilder('Please enter valid password', 400));
        }

        const access_token = user.getJwt();

        response.status(200).json({ success: true, access_token: access_token, email: user.email, userId: user._id });
    } catch (error) {
        return next(new ErrorResponseBuilder(error.message, 500));
    }
};

// @desc        Get all Users
// @route       POST /api/users
// @access      Public
exports.getUsers = async (request, response, next) => {
    await User
        .find({}, '-password')
        .then(users => {
            response
                .status(200)
                .json(
                    {
                        success: true,
                        users
                    }
                )
        })
        .catch(error => {
            return next(new ErrorResponseBuilder(
                'Fetching users failed, please try again later.',
                500
            ));
        })

};
