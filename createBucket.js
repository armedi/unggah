const { Storage } = require('@google-cloud/storage')

module.exports = gcsConfig => {
  const { bucketName } = gcsConfig
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || gcsConfig.keyFilename
  const prefix = gcsConfig.prefix || (() => `${Date.now()}-`)

  const storage = new Storage({ keyFilename });
  const bucket = storage.bucket(bucketName);

  return async (file) => {
    const givenPrefix = typeof prefix === 'function' ? prefix() : prefix
    const filename = `${givenPrefix}${file.originalname}`
    const gcsFile = bucket.file(filename);

    await gcsFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        contentEncoding: file.encoding
      }
    })

    return `https://storage.googleapis.com/${bucketName}/${filename}`
  }
}