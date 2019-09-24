const multer = require('multer')
const uploadToGcs = require('./uploadToGcs')

module.exports = ({ limits, gcsConfig }) => {
  const multerStorage = multer.memoryStorage()
  const upload = multer({ storage: multerStorage, limits })

  return {
    single: (fieldname) => [
      upload.single(fieldname),
      async (req, res, next) => {
        try {
          req.body[fieldname] = await uploadToGcs({ file: req.file, gcsConfig })
          next()
        } catch (error) {
          next(error)
        }
      }
    ],

    array: (fieldname, maxCount) => [
      upload.array(fieldname, maxCount),
      async (req, res, next) => {
        try {
          req.body[fieldname] = await Promise.all(req.files.map(file => uploadToGcs({ file, gcsConfig })))
          next()
        } catch (error) {
          next(error)
        }
      }
    ],

    fields: (fields) => [
      upload.fields(fields),
      async (req, res, next) => {
        try {
          const links = await Promise.all(Object.entries(req.files)
            .map(async ([fieldname, files]) => ({
              [fieldname]: await Promise.all(files.map(file =>
                uploadToGcs({ file, gcsConfig })
              ))
            }))
          )
          Object.assign(req.body, ...links)
          next()
        } catch (error) {
          next(error)
        }
      }
    ]
  }
}
