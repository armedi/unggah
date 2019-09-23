const { Storage } = require('@google-cloud/storage')
const fs = require('fs')

module.exports = async ({ file, gcsConfig }) => {
  const { keyFilename, bucketName } = gcsConfig
  const credentials = JSON.parse(fs.readFileSync(keyFilename, 'utf8'))

  const storage = new Storage({ projectId: credentials.project_id, keyFilename });
  const bucket = storage.bucket(bucketName);
  const filename = `${Date.now()}-${file.originalname}`
  const gcsFile = bucket.file(filename);
  const contents = file.buffer

  await gcsFile.save(contents, {
    metadata: {
      contentType: file.mimetype,
      contentEncoding: file.encoding
    }
  })

  return `https://storage.googleapis.com/${bucketName}/${filename}`
}