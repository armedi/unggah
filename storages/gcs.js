const { Storage } = require('@google-cloud/storage')
const StorageEngine = require('./storageEngine')

class GCS extends StorageEngine {
  constructor({ bucketName, rename, keyFilename }) {
    super({ bucketName, rename })
    const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || keyFilename });
    this.bucket = storage.bucket(bucketName);
  }

  _handleFile(req, file, cb) {
    const filename = this._nameFile(req, file)
    const bucketFile = this.bucket.file(filename);

    file.stream
      .pipe(bucketFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          contentEncoding: file.encoding
        }
      }))
      .on('error', cb)
      .on('finish', () => {
        cb(null, { url: `https://storage.googleapis.com/${this.bucketName}/${filename}` })
      });
  }

  _removeFile(req, file, cb) {
    const filename = this._nameFile(req, file)
    const bucketFile = this.bucket.file(filename)

    bucketFile
      .delete()
      .then(_ => cb())
      .catch(cb)
  }
}

module.exports = options => new GCS(options)
