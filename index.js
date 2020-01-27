const multer = require('multer')

function unggah(options) {
  const upload = multer(options)

  return {
    single(fieldname) {
      return [
        upload.single(fieldname),
        (req, res, next) => {
          if (!req.file) return next()
          req.body[fieldname] = req.file.url
          next()
        },
      ]
    },

    array(fieldname, maxCount) {
      return [
        upload.array(fieldname, maxCount),
        (req, res, next) => {
          req.body[fieldname] = req.files.map(file => file.url)
          next()
        },
      ]
    },

    fields(fields) {
      return [
        upload.fields(fields),
        (req, res, next) => {
          const links = Object.entries(req.files)
            .map(([fieldname, files]) => ({ [fieldname]: files.map(file => file.url) }))

          Object.assign(req.body, ...links)
          next()
        },
      ]
    },

    none: upload.none,
    any: upload.any
  }
}

module.exports = Object.assign(unggah, require('./storages'))