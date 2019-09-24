# gcs-upload

This is a convenient wrapper around multer and google cloud storage API as a single express middleware to upload file from user to Google Cloud Storage.

It will change the field for the uploaded file with a url string like http://storage.googleapis.com/`bucket-name`/`filename` that you can save in database.


### Requirements
1. Make sure you have a google cloud project with billing enabled.
2. [Enable Google Storage API](https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com) for the project.
3. [Create a service account]((https://console.cloud.google.com/apis/credentials/serviceaccountkey)) and download the credential in JSON format.


## Installation

```bash
npm install gcs-upload
```


## Usage

**options**:
- _limit_: limits of uploaded data in object form (similar to limits option in [multer](https://github.com/expressjs/multer#limits))
- _gcsConfig_:
  - keyFilename: file path for credential that you have downloaded before.
  - bucketName: the bucket name that will contain the uploaded file, you can create one through google cloud console.

It will return an upload object that have 3 methods: (.single(), .array(), and .fields()). You can use all of it just like how you would use [multer](https://github.com/expressjs/multer#singlefieldname).


### Basic Example

Don't forget the enctype="multipart/form-data" in your form.
```html
<form action="/uploadSingle" method="post" enctype="multipart/form-data">
  <input type="file" name="file" />
</form>
```

```javascript
const express = require('express')
const gcsUpload = require('gcs-upload')

const app = express()

// .......

const upload = gcsUpload({
  limits: {
    fileSize: 1e6 // in bytes
  },
  gcsConfig: {
    keyFilename: '/Users/me/google-credential-keyfile.json',
    bucketName: 'my-bucket'
  }
})

app.post('/upload-single', upload.single('file'), (req, res) => {
  console.log(req.body)
  res.end()
})

app.post('/upload-array', upload.array('files'), (req, res) => {
  console.log(req.body)
  res.end()
})

app.post('/upload-fields',
  upload.fields([{ name: 'file1' }, { name: 'file2' }]),
  (req, res) => {
    console.log(req.body)
    res.end()
  }
)

// .......
```