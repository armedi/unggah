# gcs-upload

This is a convenient wrapper around multer and google cloud storage API as a single express middleware to upload file from user to Google Cloud Storage.

It will change the field for the uploaded file with a url string like http://storage.googleapis.com/`bucket-name`/`filename` that you can save in database.


### Requirements
1. Make sure you have a google cloud project with billing enabled.
2. [Enable Google Storage API](https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com) for the project.
3. [Create a bucket](https://console.cloud.google.com/storage/create-bucket) to store the files.
4. [Create a service account](https://console.cloud.google.com/apis/credentials/serviceaccountkey) and download the credential in JSON format.


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
  - prefix (optional): it's a string or a function that return a string which will be used as a prefix for filenames being stored. 

It will return an upload object that have 3 methods: (.single(), .array(), and .fields()). You can use all of them just like how you would use [multer](https://github.com/expressjs/multer#singlefieldname).

note:
> Instead of providing keyFilename in config, you can also use `GOOGLE_APPLICATION_CREDENTIALS` environment variable to store absolute path to the credential file.


### Basic Example

Don't forget the enctype="multipart/form-data" in your form.
```html
<form action="/upload-single" method="post" enctype="multipart/form-data">
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
    keyFilename: '/Users/me/google-credential-keyfile.json',  // this can also be set using GOOGLE_APPLICATION_CREDENTIALS environment variable 
    bucketName: 'my-bucket',
    prefix: () => `${Date.now()}-` // optional, this is it's default value
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

To make uploaded files available for public view, add `Storage Object Viewer` role for allUsers. Step by step instruction can be found [here](https://cloud.google.com/storage/docs/access-control/making-data-public#buckets)
