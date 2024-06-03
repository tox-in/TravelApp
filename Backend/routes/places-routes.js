const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Public routes
router.get('/:placeId', placesControllers.getPlaceById);

router.get('/user/:userId', placesControllers.getPlacesByUserId);

// Authentication middleware
router.use(checkAuth);

// Authenticated routes
// router.post(
//   '/',
//   fileUpload.single('image'),
//   [
//     check('title').not().isEmpty(),
//     check('description').isLength({ min: 5 }),
//     check('address').not().isEmpty()
//   ],
//   placesControllers.createPlace
// );

router.patch(
  '/:placeId',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:placeId', placesControllers.deletePlace);

module.exports = router;
