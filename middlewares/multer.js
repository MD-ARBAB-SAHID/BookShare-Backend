const multer = require("multer");

const storage = multer.memoryStorage();
const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const imageGetter = multer({
  limits: 500000,
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE[file.mimetype];

    const error = isValid ? null : new Error("Invalid Image");
    cb(error, isValid);
  },
});

module.exports = imageGetter;
