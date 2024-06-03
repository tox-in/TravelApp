const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');

const usersController = require('./../controllers/users-controller');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImage = upload.single('image');

const validateSignUp = [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 })
  ];  

router.get('/', usersController.getUsers);
router.post('/signup', uploadImage, validateSignUp, usersController.signUp);
router.post('/login', usersController.logIn);

module.exports = router;