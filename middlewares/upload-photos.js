const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

// add keys from file downloaded from aws
// follow video 12 and 11
aws.config.update({
  secretAccessKey: process.env.AWSSecretKey,
  accessKeyId: process.env.AWSAccessKeyId
})

const s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3: s3,
    // in bucket add bucket name from aws
    bucket: 'brahmapuri-wellness-ecom',
    // in acl allow access to read for public
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname})
    },
    key: (req, file, cb) =>{
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload