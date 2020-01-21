const multer = require('multer')
const createBucket = require('./createBucket')

module.exports = ({ limits, gcsConfig }) => {
  const multerStorage = multer.memoryStorage()
  const upload = multer({ storage: multerStorage, limits })

  const saveToBucket = createBucket(gcsConfig)

  return {
    single: fieldname => [
      upload.single(fieldname),
      async (req, res, next) => {
        if (!req.file) return next()
        try {
          req.body[fieldname] = await saveToBucket(req.file)
          next()
        } catch (error) {
          next(error)
        }
      },
    ],

    array: (fieldname, maxCount) => [
      upload.array(fieldname, maxCount),
      async (req, res, next) => {
        try {
          req.body[fieldname] = await Promise.all(req.files.map(saveToBucket))
          next()
        } catch (error) {
          next(error)
        }
      },
    ],

    fields: fields => [
      upload.fields(fields),
      async (req, res, next) => {
        try {
          const links = (await Promise.all(
            Object.entries(req.files)
              .map(([fieldname, files]) => Promise.all([fieldname, Promise.all(files.map(saveToBucket))]))
          ))
            .map(([fieldname, files]) => ({ [fieldname]: files }))

          Object.assign(req.body, ...links)
          next()
        } catch (error) {
          next(error)
        }
      },
    ],
  }
}
