const multer = require('multer')
const uploadToGcs = require('./uploadToGcs')

module.exports = ({ limits, gcsConfig }) => {
  const multerStorage = multer.memoryStorage()
  const upload = multer({ storage: multerStorage, limits })

  return {
    single: (fieldname) => [
      upload.single(fieldname),
      async (req, res, next) => {
        req.body[fieldname] = await uploadToGcs({ file: req.file, gcsConfig })
        next()
      }
    ],

    array: (fieldname, maxCount) => [
      upload.array(fieldname, maxCount),
      async (req, res, next) => {
        req.body[fieldname] = await Promise.all(req.files.map(file => uploadToGcs({ file, gcsConfig })))
        next()
      }
    ],

    fields: (fields) => [
      upload.fields(fields),
      async (req, res, next) => {
        for (let [fieldname, files] of Object.entries(req.files)) {
          req.body[fieldname] = await Promise.all(files.map(file => uploadToGcs({ file, gcsConfig })))
        }
        next()
      }
    ]
  }
}
