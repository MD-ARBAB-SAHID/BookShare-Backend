const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("./aws");
const fs = require("fs");
const Auth = require("../middlewares/auth");
const Auth2 = require("../middlewares/AuthenticationFirst");
const dotenv = require("dotenv");
const path = require("path");
const { Router } = require("express");
dotenv.config({ path: path.join(__dirname, "../", ".env") });

const signup = async (req, res, next) => {
 
  const errors = validationResult(req);
  let existingUser;

  let imagePath;
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form correctly ", 406)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new HttpError("Password and Confirm Password does not match", 406)
    );
  }

  const {
    email,
    password,
    semester,
    college,
    branch,
    name,
    contactNo,
  } = req.body;
  if (
    !(
      branch === "CSE" ||
      branch === "IT" ||
      branch === "EE" ||
      branch === "CE" ||
      branch === "BT" ||
      branch === "TE" ||
      branch === "OTHERS"
    )
  ) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form again", 406)
    );
  }
  if (
    !(
      semester === "1" ||
      semester === "2" ||
      semester === "3" ||
      semester === "4" ||
      semester === "5" ||
      semester == "6" ||
      semester === "7" ||
      semester === "8"
    )
  ) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form again", 406)
    );
  }

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Could not create account.Try Again", 500));
  }

  if (existingUser) {
    return next(new HttpError("User exist.Try again later", 406));
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create account.Try Again", 500));
  }
  if (!req.file) {
    imagePath = "uploads\\images\\default-profile-picture1.jpg";
  } else {
    imagePath = req.file.path;
    try {
      const result = await uploadFile(req.file);
      imagePath = `uploads\\images\\${result.Key}`;
    } catch (err) {
      return next(new HttpError("Image Problem", 500));
    }
  }
  const userDetails = new User({
    name,
    email,
    password: hashedPassword,
    branch,
    image: imagePath,
    semester,
    books: [],
    incomingRequest: [],
    outgoingRequest: [],
    contactNo,
    college,
  });

  try {
    await userDetails.save();
  } catch (err) {
   
    return next(new HttpError("Could not create account.Try Agains", 500));
  }

  let token;
  try {
    token = await jwt.sign(
      { email: userDetails.email, id: userDetails.id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not create account.Try Again", 500));
  }

  if (req.file) {
    fs.unlink(req.file.path, (err) => {});
  }

  return res.json({
    id: userDetails.id,
    email: userDetails.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  let existingUser;
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form correctly ", 406)
    );
  }
  const { email, password } = req.body;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Could not log you in ,try again"), 500);
  }

  if (!existingUser) {
    return next(new HttpError("Invalid credentials"), 401);
  }

  let passIsValid = false;

  try {
    passIsValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Invalid credentials"), 401);
  }

  if (!passIsValid) {
    return next(new HttpError("Invalid credentials"), 401);
  }

  let token;
  try {
    token = await jwt.sign(
      { email: existingUser.email, id: existingUser.id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not log you in.Try Again", 500));
  }

  return res.json({
    id: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const profileData = async (req, res, next) => {
  let existingUser = req.existingUser;

  const userDetails = {
    id: existingUser._id,
    name: existingUser.name,
    email: existingUser.email,
    college: existingUser.college,
    branch: existingUser.branch,
    semester: existingUser.semester,
    image: existingUser.image,
    contactNo: existingUser.contactNo,
  };

  return res.json(userDetails);
};

module.exports.signup = signup;
module.exports.login = login;
module.exports.profileData = profileData;
