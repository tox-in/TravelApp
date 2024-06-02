const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error.js");
const getCoordsForAddress = require("../util/location.js");
const Place = require("../models/place.js");
const User = require("../models/user.js");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not find a place.", 500)
        );
    }

    if (!place) {
        return next(
            new HttpError("Could not find a place for the provided id", 404)
        );
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let userWithPlaces;

    try {
        userWithPlaces = await User.findById(userId).populate("places");
    } catch (err) {
        return next(
            new HttpError("Fetching places failed, please try again later", 500)
        );
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError("Could not find places for the provided user id.", 404)
        );
    }

    res.json({
        places: userWithPlaces.places.map((place) =>
            place.toObject({ getters: true })
        ),
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed. Please correct.", 422));
    }

    const { title, description, address } = req.body;
    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (err) {
        return next(err);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path, // Cloudinary URL
        creator: req.userData.userId,
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError("Creating place failed, please try again", 500));
    }

    if (!user) {
        return next(new HttpError("Could not find user for provided id.", 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Creating place failed, please try again.", 500));
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params
}