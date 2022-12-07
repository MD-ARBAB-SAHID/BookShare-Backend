const {CognitoUser} = require("amazon-cognito-identity-js")
  const Userpool = require("../UserPool");
  const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

  const signUp = async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
          new HttpError("Invalid Inputs.Please fill the form correctly ", 406)
        );
      }
      const {email,password,cPassword} =  req.body;
      if(password!==cPassword)
      {
          return next(new HttpError("Password and confirm Password do not match",406));
      }
      Userpool.signUp(email, password, [], null, (err, data) => {
        if (err) {
          console.log(err.message);
          return next(new HttpError(err.message,400));
        } else {
          console.log(data);
          return res.status(200).json(data);
        }
      });
  }

  const otpVerify = async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
          new HttpError("Invalid Inputs.Please fill the form correctly ", 406)
        );
      }
    const email = req.body.email;
    const conformationCode = req.body.otp;
    if( !conformationCode ||
        conformationCode.trim().length == 0)
        {
            return next(new HttpError("Please enter a correct OTP",400));
        }
        const user = new CognitoUser({
            Username: email,
            Pool: Userpool,
          });
          user.confirmRegistration(conformationCode, true, function (err, result) {
            if (err) {
             return next(new HttpError(err.message,400));
              
            } else {
             
              return res.status(200).json(result);
            }
          });

  }

  module.exports.signUp = signUp;
  module.exports.otpVerify = otpVerify