const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const streamifier = require("streamifier");

const HttpError = require("../models/http-error.js");
const User = require("../models/user.js");

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({
      users: users.map((user) => user.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Could not find users", 500));
  }
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed. Please correct.", 422));
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("A problem occurred.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User already exists. Please try logging in instead.", 422)
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("Could not create a user. Please try again.", 500)
    );
  }

  // Upload image to Cloudinary
  try {
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "travel",
      },
      function (error, result) {
        if (error) {
          console.error("Error uploading avatar:", error);
          return res
            .status(500)
            .json({ success: false, message: "Failed to upload avatar" });
        }

        if (result && result.url) {
          const imageUrl = result.url;

          console.log(name, email, hashedPassword, imageUrl);

          User.create({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            places: [],
          })
            .then((user) => {
              const token = generateToken(user.id);
              res.status(201).json({
                userId: user.id,
                email: user.email,
                token: token,
                image: user.image,
                name: user.name,
              });
            })
            .catch((error) => {
              return next(
                new HttpError("Could not create a user. Please try again.", 500)
              );
            });
        } else {
          console.error("Upload result is missing the URL.");
          return res
            .status(500)
            .json({ success: false, message: "Failed to upload avatar" });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload avatar" });
  }
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  let user;

  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed try again"), 422);
  }

  if (!user) {
    return next(
      new HttpError(
        "Could not identify user. Credentials seem to be wrong.",
        401
      )
    );
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next("Could not log you in, please check your credentials.", 500);
  }

  if (!isValidPassword) {
    return next("Could not log you in, please check your credentials.", 403);
  }

  let token;

  try {
    token = generateToken(user.id);
  } catch (err) {
    return next(new HttpError("Logging in failed. Please correct.", 500));
  }

  res.status(200).json({ userId: user.id, email: user.email, token: token, name: user.name });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
