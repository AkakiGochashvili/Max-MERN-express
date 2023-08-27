const ErrorResponseBuilder = require("../helper/error-response-builder.helper");
const Place = require("../model/place.model");
const User = require("../model/user.model");
const cloudinary = require('../util/cloudinary')

// @desc        Get PLace BY ID
// @route       GET /api/places/:id
// @access      Public
exports.getPlaceById = async (request, response, next) => {
    await Place
        .findById(request.params.id)
        .then((place) => {
            if (!place) {
                return next(
                    new ErrorResponseBuilder(
                        'Could not find a place for the provided id.',
                        404
                    )
                )
            }

            response
                .status(200)
                .json(
                    {
                        success: true,
                        place
                    }
                )
        });
}

// @desc        Get Places By User ID
// @route       GET /api/places/user/:id
// @access      Public
exports.getPlacesByUserId = async (request, response, next) => {
    await Place
        .find({ user: request.params.id })
        .then((places) => {
            if (!places && !places.length) {
                return next(
                    new ErrorResponseBuilder(
                        'Could not find a place for the provided user id.',
                        404
                    )
                )
            }

            response
                .status(200)
                .json(
                    {
                        success: true,
                        places
                    }
                )
        })
}


// @desc        Create User Place
// @route       POST /api/places/user/:user_id
// @access      Public
exports.createPlace = async (request, response, next) => {
    request.user = {}
    request.user._id = request.body.creator

    const user = await User.findById(request.user._id)

    if (!user) {
        return next(
            new ErrorResponseBuilder('User not found', 404)
        )
    }

    const requested_place = { ...request.body }

    requested_place.location = request.location

    requested_place.user = user._id

    const place = await Place
        .create(requested_place)
        .catch((error) => {
            return next(new ErrorResponseBuilder(error, 500));
        });

    let image

    await cloudinary.uploader
        .upload(request.body.image_base64, {
            public_id: `${place._id}`,
            upload_preset: "MERN-stack-place-images",
            crop: "thumb"
        })
        .then((result) => {
            image = result.secure_url
        }).catch(async (error) => {
            await Place.findByIdAndDelete(place._id)

            return next(
                new ErrorResponseBuilder(`The user profile image could not be uploaded to the cloud`, 400)
            )
        });

    await Place
        .findByIdAndUpdate(place._id, { image }, {
            runValidators: true,
            new: true
        })
        .then(updated_place => {
            user.places.push(place._id);

            user.save();

            response.status(201).json({ success: true, new_place: updated_place });
        })
        .catch(async error => {
            return next(
                new ErrorResponseBuilder(`The user profile image could not be uploaded to the cloud`, 400)
            )
        })
};

// @desc        Update User Place
// @route       PATCH /api/places/user/:id
// @access      Public
exports.updatePlace = async (request, response, next) => {
    request.user = {}
    request.user._id = request.body.creator

    const place = await Place.findById(request.params.id)

    if (!place) {
        return next(
            new ErrorResponseBuilder('Place not found', 404)
        )
    }

    const user = await User.findById(request.user._id)

    if (!user) {
        return next(
            new ErrorResponseBuilder('User not found', 404)
        )
    }

    if (String(user._id) !== String(place.user)) {
        return next(
            new ErrorResponseBuilder('You are not allowed to edit this place.', 404)
        )
    }


    await Place
        .findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true,

        })
        .then((updated_place) => {
            response
                .status(201)
                .json(
                    {
                        success: true,
                        updated_place
                    }
                )
        })
        .catch((error) => {
            return next(new ErrorResponseBuilder(error, 500));
        });
};

// @desc        Delete User Place
// @route       DELETE /api/places/user/:id
// @access      Public
exports.deletePlace = async (request, response, next) => {
    request.user = {}
    request.user._id = request.body.creator

    const place = await Place.findById(request.params.id)

    if (!place) {
        return next(
            new ErrorResponseBuilder('Place not found', 404)
        )
    }

    const user = await User.findById(request.user._id)

    if (!user) {
        return next(
            new ErrorResponseBuilder('User not found', 404)
        )
    }

    if (user._id !== user._id) {
        return next(
            new ErrorResponseBuilder('You are not allowed to delete this place.', 404)
        )
    }

    await cloudinary.uploader
        .destroy(`MERN-stack-backend/place-images/${place._id}`)
        .catch(async (error) => {
            return next(
                new ErrorResponseBuilder(`The user profile image could not be deleted from the cloud`, 400)
            )
        });

    await Place
        .findByIdAndDelete(request.params.id)
        .then(() => {
            user.places = user.places.filter((place_id) => String(place_id) !== String(place._id))

            user.save()

            response
                .status(201)
                .json(
                    {
                        success: true,
                    }
                )
        })
        .catch((error) => {
            return next(new ErrorResponseBuilder(error, 500));
        });
};
