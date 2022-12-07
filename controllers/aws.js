const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../", ".env") });
const { v1: uuId } = require("uuid");
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = process.env.AWS_PERSONAL_BUCKET_NAME;
const region = process.env.AWS_PERSONAL_BUCKET_REGION;
const accessKeyId = process.env.AWS_PERSONAL_ACCESS_KEY;
const secretAccessKey = process.env.AWS_PERSONAL_SECRET_KEY;
const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const uploadFile = (file) => {
  const extention = MIME_TYPE[file.mimetype];
  const fileName = uuId() + "." + extention;

  const uploadParams = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: fileName,
  };

  return s3.upload(uploadParams).promise();
};

const getFile = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
};
module.exports.uploadFile = uploadFile;
module.exports.getFile = getFile;
