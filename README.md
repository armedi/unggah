# gcs-upload

This is a simple express middleware to upload file from user to Google Cloud Storage.

It will change the field for the uploaded file with a url string like http://storage.googleapis.com/`bucket-name`/`filename` that you can save in database.



### Requirements
1. Make sure you have a google cloud project with billing enabled.
2. Create a service account and download the credential in JSON format. Go to this [link](https://console.cloud.google.com/apis/credentials/serviceaccountkey?_ga=2.53729192.-1053042206.1569069058).



## Usage

```bash
npm install gcs-upload
```

```javascript
const express = require('express')
const gcsUpload = require('gcs-upload')

const app = express()

app.post('/upload',
  gcsUpload({
    fieldname: 'file', // field of user request which contain the file
    gcs: {
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // file path for credential that you have downloaded before.
      bucketName: process.env.GOOGLE_BUCKET_NAME // the bucket name that will contain the uploaded file, you can create one through google cloud console.
    }
  }),
  (req, res) => {
    res.status(200).json({link: req.body.file})
  })

// ...
```