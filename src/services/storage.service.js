const { S3Client } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');

// const { S3 } = require('@aws-sdk/client-s3');

const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/config');
// const path = require('path');

// Configure the S3 client

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Configure the multer storage using multer-s3
const storage1 = multerS3({
  s3: s3Client,
  bucket: config.aws.s3BucketName,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata(req, file, cb) {
    cb(null, { fieldname: file.fieldname });
  },
  key(req, file, cb) {
    const fileName = `${Date.now()}_${file.fieldname}_${file.originalname}`;
    cb(null, fileName);
  },
});
// // limits:{fileSize : 2000000}
// fileFilter: function (req, file, cb) {
//   checkFileType(file, cb);
// }
const upload = multer({ storage: storage1 });

// const upload = multer({
//   storage: storage1,
// });
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const s3 = new AWS.S3();

const deleteImageFromAws = (keyId) => {
  const params = {
    Bucket: config.aws.s3BucketName,
    Key: keyId,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Succesfully deleted', data);
    }
  });
};

const getSignedUrl = async (key) => {
  const params = {
    Bucket: config.aws.s3BucketName,
    Key: key,
    Expires: 100,
  };
  const signedUrl = await s3.getSignedUrlPromise('putObject', params);
  return signedUrl;
};

module.exports = { upload, deleteImageFromAws, getSignedUrl };
