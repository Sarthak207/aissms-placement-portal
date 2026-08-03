const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const makeStorage = (folder, allowedFormats) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `aissms-placement/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
    },
  });

const resumeStorage = makeStorage('resumes', ['pdf']);
const photoStorage = makeStorage('photos', ['jpg', 'jpeg', 'png']);
const logoStorage = makeStorage('logos', ['jpg', 'jpeg', 'png', 'svg']);
const documentStorage = makeStorage('documents', ['pdf', 'jpg', 'jpeg', 'png']);

module.exports = { cloudinary, resumeStorage, photoStorage, logoStorage, documentStorage };
