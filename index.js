const multer = require('multer')
const { Storage } = require('@google-cloud/storage');

const multerStorage = multer.memoryStorage()
const upload = multer({ storage: multerStorage })

const uploadToGcs = (fieldname, gcsOptions) => (req, res, next) => {
  const { projectId, keyFilename, bucketName } = gcsOptions

  const storage = new Storage({ projectId, keyFilename });
  const bucket = storage.bucket(bucketName);
  const filename = `${Date.now()}-${req.file.originalname}`
  const file = bucket.file(filename);
  const contents = req.file.buffer

  file.save(contents, {
    metadata: {
      contentType: req.file.mimetype,
      contentEncoding: req.file.encoding
    }
  })
    .then((out) => {
      req.body[fieldname] = `https://storage.googleapis.com/${bucketName}/${filename}`
      next()
    })
    .catch(next)
}

module.exports = ({fieldname, gcs}) => [upload.single(fieldname), uploadToGcs(fieldname, gcs)]