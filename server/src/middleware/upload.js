const multer = require('multer');
const { resumeStorage, photoStorage, logoStorage, documentStorage } = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

const MB = 1024 * 1024;

function fileFilterFactory(allowedMimes) {
  return (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(ApiError.badRequest(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`));
    }
    return cb(null, true);
  };
}

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * MB },
  fileFilter: fileFilterFactory(['application/pdf']),
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * MB },
  fileFilter: fileFilterFactory(['image/jpeg', 'image/png']),
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * MB },
  fileFilter: fileFilterFactory(['image/jpeg', 'image/png', 'image/svg+xml']),
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * MB },
  fileFilter: fileFilterFactory(['application/pdf', 'image/jpeg', 'image/png']),
});

module.exports = { uploadResume, uploadPhoto, uploadLogo, uploadDocument };
