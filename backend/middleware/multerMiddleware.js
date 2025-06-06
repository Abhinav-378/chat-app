const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public', 'temp')) // Use relative path
  },
    filename: function (req, file, cb) {
        //   cb(null, file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))

    }
  })
  
module.exports.upload = multer({ storage: storage })