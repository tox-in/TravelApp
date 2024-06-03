const express = require('express');
const { check } = require('express-validator');
const multer = require("multer");

const placesControllers = require("../controllers/places-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImage = upload.single("image");

router.get("/:placeId", placesControllers.getPlaceById);

router.get("/user/:userId", placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post("/newPlace", uploadImage, placesControllers.createPlace);

router.patch(
  "/:placeId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:placeId", placesControllers.deletePlace);

module.exports = router;