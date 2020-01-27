const S3 = require('aws-sdk/clients/s3')
const StorageEngine = require('./storageEngine')

class SimpleStorageService extends StorageEngine {
  constructor({ endpoint, accessKeyId, secretAccessKey, bucketName, rename, ACL = 'public-read' }) {
    super({ bucketName, rename })
    this._s3 = new S3({
      endpoint,
      accessKeyId,
      secretAccessKey
    })
    this.ACL = ACL
  }

  _handleFile(req, file, cb) {
    const filename = this._nameFile(req, file)

    this._s3.upload({
      Bucket: this.bucketName,
      Key: filename,
      Body: file.stream,
      ACL: this.ACL
    }, (err, data) => {
      cb(err, {
        url: data.Location || `https://${this.bucketName}.${this._s3.endpoint.host}/${filename}`
      })
    })
  }

  delete(filename) {
    return new Promise((resolve, reject) => {
      this._s3.deleteObject({
        Bucket: this.bucketName,
        Key: filename,
      }, (err, data) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = SimpleStorageService
