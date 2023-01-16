const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname);
  },
});
const upload = multer({ storage: storage });

module.exports = upload;
