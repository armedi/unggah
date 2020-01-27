module.exports = {
  // require only when needed, so it won't throw error when user doesn't have @google-cloud/storage or aws-sdk installed
  gcs: options => {
    const GCS = require('./gcs')
    return new GCS(options)
  },
  s3: options => {
    const S3 = require('./s3')
    return new S3(options)
  }
}