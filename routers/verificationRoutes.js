const express = require("express");
const { body } = require("express-validator");
const Router = express.Router();
const verificationController = require("../controllers/verification")
Router.post("/sign-up",[body("email").isEmail(),body("password").isLength({min:8})],verificationController.signUp);
Router.post("/otp-verify",body("email").isEmail(),verificationController.otpVerify);


module.exports = Router;