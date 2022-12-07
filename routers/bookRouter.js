const express = require("express");
const Router = express.Router();
const bookController = require("../controllers/books"); 
const authMiddlerware  =require("../middlewares/auth");
const AuthenticationFirst = require("../middlewares/AuthenticationFirst");
const imageGetter = require("../middlewares/multer");
const { body } = require("express-validator");
const messageController = require("../controllers/messages");

Router.use(authMiddlerware);
Router.use(AuthenticationFirst);



Router.post("/addBook",imageGetter.single("bookImage"),
[body("name").notEmpty(),
body("author").notEmpty(),
body("description").notEmpty(),
body("contactNo").isLength({min:10,max:10}),
body("address").notEmpty(),
body("subject").notEmpty(),

],bookController.addBook)


Router.get("/myBooks",bookController.myBooks);
Router.get("/dashboard",bookController.dashboard);
Router.post("/filterBooks",bookController.filterBooks);
Router.post("/addRequest",messageController.addRequest);
Router.get("/incomingRequest",messageController.incomingRequest);
Router.get("/outgoingRequest",messageController.outgoingRequest);
Router.post("/result",messageController.resultRequest);
Router.get("/book-details/:bookId",bookController.book);
module.exports = Router;