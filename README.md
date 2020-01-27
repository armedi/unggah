# unggah

This is a convenient wrapper around multer, google cloud storage, and AWS S3 API as a single express middleware to upload file from user to Google Cloud Storage or AWS S3 and S3 compatible providers.

It will change the field for the uploaded file with a url string like
- https://storage.googleapis.com/`bucket-name`/`filename` for Google Cloud Storage 
- https://`bucket-name`.s3-ap-southeast-1.amazonaws.com/`filename` for AWS S3

The url now can be saved to database.


## Installation

```bash
npm install unggah
```

Then install either `aws-sdk` or `@google-cloud/storage`, depending on what service you're going to use.

```bash
npm install aws-sdk
# or
npm install @google-cloud/storage
```


## Usage

```html
<!-- Don't forget the enctype="multipart/form-data" in your form. -->
<form action="/upload-single" method="post" enctype="multipart/form-data">
  <input type="file" name="file" />
</form>
```

```javascript
const express = require('express')
const unggah = require('unggah')

const app = express()

const upload = unggah({
  limits: {
    fileSize: 1e6 // in bytes
  },
  storage: storage // storage configuration for google cloud storage or S3
})
```

**options**:
- _limits_: limits of uploaded data in object form (similar to limits option in [multer](https://github.com/expressjs/multer#limits))
- _storage_: setup for cloud storage provider that you want to use (Details in following sections).

It will return an upload object that have 3 methods: (.single(), .array(), and .fields()). You can use all of them just like how you would use [multer](https://github.com/expressjs/multer#singlefieldname).

---

### Using Google Cloud Storage

#### Prerequisites
1. Make sure you have a google cloud project with billing enabled.
2. [Enable Google Storage API](https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com) for the project.
3. [Create a bucket](https://console.cloud.google.com/storage/create-bucket) to store the files.
4. [Create a service account](https://console.cloud.google.com/apis/credentials/serviceaccountkey) and download the credential in JSON format.

#### storage configurations
- keyFilename: file path for credential that you have downloaded before.
- bucketName: the bucket name that will contain the uploaded file, you can create one through google cloud console.
- rename (optional): it's a string or a function that return a string which will be used as name for files being stored. If omitted it will use the original filename prefixed with the timestamp.

```javascript
const storage = unggah.gcs({
  keyFilename: '/Users/me/google-credential-keyfile.json',
  bucketName: 'my-bucket',
  rename: (req, file) => {
    return `${Date.now()}-${file.originalname}`  // this is the default
  }
})
```

note:
> To make uploaded files available for public view, add `Storage Object Viewer` role for allUsers. Step by step instruction can be found [here](https://cloud.google.com/storage/docs/access-control/making-data-public#buckets)

---

### Using AWS S3 or S3 compatible providers

#### Prerequisites
1. [Create a bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html) to store the files.
2. [Obtain access key id and it's secret](https://aws.amazon.com/blogs/security/how-to-find-update-access-keys-password-mfa-aws-management-console/) for your AWS user account.

#### storage configurations
- endpoint: url endpoint for your S3 storage (example: `s3.ap-southeast-1.amazonaws.com`)
- accessKeyId: Access Key ID that you get from prerequisite #2,
- secretAccessKey: Secret Access Key that you get from prerequisite #2,
- bucketName: the bucket name that will contain the uploaded file, you can create one through google cloud console.
- rename (optional): it's a string or a function that return a string which will be used as name for files being stored. If omitted it will use the original filename prefixed with the timestamp.

```javascript
const storage = unggah.s3({
  endpoint: 's3.ap-southeast-1.amazonaws.com',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: 'my-bucket',
  rename: (req, file) => {
    return `${Date.now()}-${file.originalname}`  // this is the default
  }
})
```

---

```javascript
// .......

const upload = unggah({
  limits: {
    fileSize: 1e6 // in bytes
  },
  storage: storage
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

### Deleting File

The storage object has .delete() method that you can use to delete a file

```javascript
storage.delete('file.txt')
  .then(() => console.log('deleted'))
  .catch(err => console.log(err.message))
```

