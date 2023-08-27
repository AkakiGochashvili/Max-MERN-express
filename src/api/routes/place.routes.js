const { Router } = require('express');
const { getPlaceById, getPlacesByUserId, createPlace, deletePlace, updatePlace } = require('../controller/place.controller');
const { jwtProtect } = require('../middleware/jwt-protect.middleware');
const getCoordsForAddress = require('../middleware/location.middleware');
const { MongoIDValidator } = require('../validator/mongo-id.validator');
const { CreatePlaceValidator, UpdatePlaceValidator } = require('../validator/place');


const router = Router();

router.route('/:id').get(MongoIDValidator, getPlaceById);

router.route('/user/:id').get(MongoIDValidator, getPlacesByUserId);

router.route('/').post(jwtProtect, CreatePlaceValidator, getCoordsForAddress, createPlace);

router.route('/:id').patch(jwtProtect, UpdatePlaceValidator, updatePlace);

router.route('/:id').delete(jwtProtect, MongoIDValidator, deletePlace);

module.exports = router;
