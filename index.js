const multer = require('multer')

class Unggah {
  constructor(options) {
    this._upload = multer(options)
  }

  single(fieldname) {
    return [
      this._upload.single(fieldname),
      (req, res, next) => {
        if (!req.file) return next()
        req.body[fieldname] = req.file.url
        next()
      },
    ]
  }

  array(fieldname, maxCount) {
    return [
      this._upload.array(fieldname, maxCount),
      (req, res, next) => {
        req.body[fieldname] = req.files.map(file => file.url)
        next()
      },
    ]
  }

  fields(fields) {
    return [
      this._upload.fields(fields),
      (req, res, next) => {
        const links = Object.entries(req.files)
          .map(([fieldname, files]) => ({ [fieldname]: files.map(file => file.url) }))

        Object.assign(req.body, ...links)
        next()
      },
    ]
  }

  none() {
    return this._upload.none()
  }

  any() {
    return this._upload.any()
  }
}


module.exports = Unggah