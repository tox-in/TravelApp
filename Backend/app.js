require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');
const connectDB = require("./config/Mongo_connect.js");

const app = express();

app.use(bodyParser.json());


// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE'
  );
  next();
});

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', userRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  next(error);
});

// General error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.error(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500).json({
    message: error.message || 'An unknown error occurred.'
  });
});

connectDB();