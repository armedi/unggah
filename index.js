const multer = require('multer')
const uploadToGcs = require('./uploadToGcs')
const path = require('path')

module.exports = ({ limits, gcsConfig }) => {
  const multerStorage = multer.memoryStorage()
  const upload = multer({ storage: multerStorage, limits })

  /*
   * https://nodejs.org/api/modules.html#modules_module_parent
   *
   * `module.parent.filename` will return the absolute path of
   * a file that called this module
   */
  const dirCaller = path.dirname(module.parent.filename)

  /* then the absolute path is resolved with relative path from user */
  const resolvedPath = path.resolve(dirCaller, gcsConfig.keyFilename)

  /* then reassign it to `gcsConfig.keyFilename` */
  gcsConfig.keyFilename = resolvedPath

  /*
   * This patch has backwards compatibility
   * references:
   * https://nodejs.org/api/path.html#path_path_resolve_paths
   */

  return {
    single: fieldname => [
      upload.single(fieldname),
      async (req, res, next) => {
        if (!req.file) return next()
        try {
          req.body[fieldname] = await uploadToGcs({ file: req.file, gcsConfig })
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
          req.body[fieldname] = await Promise.all(
            req.files.map(file => uploadToGcs({ file, gcsConfig })),
          )
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
          const links = await Promise.all(
            Object.entries(req.files).map(async ([fieldname, files]) => ({
              [fieldname]: await Promise.all(
                files.map(file => uploadToGcs({ file, gcsConfig })),
              ),
            })),
          )
          Object.assign(req.body, ...links)
          next()
        } catch (error) {
          next(error)
        }
      },
    ],
  }
}
