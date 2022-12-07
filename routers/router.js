const express = require("express");
const { body } = require("express-validator");
const Router = express.Router();
const userController = require("../controllers/user");
const authMiddlerware  =require("../middlewares/auth");
const Auth2 = require("../middlewares/AuthenticationFirst");

const imageGetter = require("../middlewares/multer");
Router.post("/signup",
imageGetter.single("image"),[
    body("name").notEmpty(),
    body("college").notEmpty(),
    body('email').isEmail(),
body("password").isLength({min:6}),
body("confirmPassword").isLength({min:6}),
body("contactNo").isLength({min:10,max:10})],userController.signup)

Router.post("/login",[body("email").isEmail(),
body("password").isLength({min:6})],userController.login)


Router.use(authMiddlerware);
Router.use(Auth2);

Router.get("/profile",userController.profileData);

module.exports = Router;
