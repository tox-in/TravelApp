const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const uuid = require('uuid/v1');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/images',
    format: async (req, file) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      return ext; // supports promises as well
    },
    public_id: (req, file) => uuid(), // use UUID for public ID
  },
});

const fileUpload = multer({
  limits: { fileSize: 50000 }, // limit file size to 50 KB
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid Mime Type');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
