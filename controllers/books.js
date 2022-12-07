const HttpError = require("../models/http-error");
const User = require("../models/user-model");
const Book = require("../models/book-model");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const {uploadFile} = require("./aws");
const fs = require("fs");
const book = async (req, res, next) => {
  const bookId = req.params.bookId;
  let bookDetails;
  try {
    bookDetails = await Book.findById(bookId).populate("owner");
  } catch (err) {
    return next(new HttpError("Book details not found,try again", 500));
  }

  if (!bookDetails) {
    return next(new HttpError("Book Not Found , try again", 500));
  }

  let book1 = {
    id: bookDetails._id,
    name: bookDetails.name,
    author: bookDetails.author,
    image: bookDetails.image,
    description: bookDetails.description,
    semester: bookDetails.semester,
    subject: bookDetails.subject,
    ownerName: bookDetails.owner.name,
    branch: bookDetails.branch,
    owner: bookDetails.owner._id,
  };

  return res.json(book1);
};

const addBook = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form again", 406)
    );
  }

  const {
    subject,
    semester,
    branch,
    contactNo,
    address,
    name,
    author,
    description,
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
  let existingUser = req.existingUser;
  let imagePath;
  if (!req.file) {
    return next(new HttpError("Please Provide Book Image",406));
  } else {
    imagePath = req.file.path;
    try {
      const result = await uploadFile(req.file);
      imagePath = `uploads\\images\\${result.Key}`;
    } catch (err) {
      return next(new HttpError("Image Problem", 500));
    }
  }

  const bookDetails = new Book({
    name,
    author,
    branch,
    description,
    semester,
    image: imagePath,
    contactNo,
    address,
    subject,
    owner: existingUser._id,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await bookDetails.save({ session: sess });
    existingUser.books.push(bookDetails);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not add book,try again", 500));
  }
  if (req.file) {
    fs.unlink(req.file.path, (err) => {});
  }
  return res.json(bookDetails);
};

const myBooks = async (req, res, next) => {
  const id = req.userData;
  let existingUser;
  try {
    existingUser = await User.findById(id).populate("books");
  } catch (err) {
    return next(new HttpError("Could not show books , try again", 500));
  }
  let bookDetailsArray = [];
  bookDetailsArray = existingUser.books.map((element)=>{
      return {
          id:element._id,
          name:element.name
      }
  })
  return res.json(bookDetailsArray);
};

const dashboard = async (req, res, next) => {
  let books;
  const id = req.userData;
  const branchName = req.existingUser.branch;
  try {
    books = await Book.find({
      branch: branchName,
      owner: { $not: { $eq: id } },
    }).populate("owner");
   
    let dashboardBooks = [];
    dashboardBooks = books.map((element) => {
      let book1 = {
        id: element._id,
        name: element.name,
        author: element.author,
        image: element.image,
        description: element.description,
        semester: element.semester,
        subject: element.subject,
        ownerName: element.owner.name,
        branch: element.branch,
        owner: element.owner._id,
      };
      return book1;
    });
    return res.json(dashboardBooks);
  } catch (err) {
    
    return next(new HttpError("Could not show books , try again", 500));
  }
};

const filterBooks = async (req, res, next) => {
  const branchName = req.body.branch;
  const semesterNo = req.body.semester;
  const id = req.userData;
  if (
    !(
      branchName === "CSE" ||
      branchName === "IT" ||
      branchName === "EE" ||
      branchName === "CE" ||
      branchName === "BT" ||
      branchName === "TE" ||
      branchName === "OTHERS"
    )
  ) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form again", 406)
    );
  }
  if (
    !(
      semesterNo === "1" ||
      semesterNo === "2" ||
      semesterNo === "3" ||
      semesterNo === "4" ||
      semesterNo === "5" ||
      semesterNo == "6" ||
      semesterNo === "7" ||
      semesterNo === "8" ||
      semesterNo === "ALL"
    )
  ) {
    return next(
      new HttpError("Invalid Inputs.Please fill the form again", 406)
    );
  }
  let books;
  let dashboardBooks = [];
  if (semesterNo === "ALL") {
    try {
      books = await Book.find({
        branch: branchName,
        owner: { $not: { $eq: id } },
      }).populate("owner");
     

      dashboardBooks = books.map((element) => {
        let book1 = {
          id: element._id,
          name: element.name,
          author: element.author,
          image: element.image,
          description: element.description,
          semester: element.semester,
          subject: element.subject,
          ownerName: element.owner.name,
          branch: element.branch,
          owner: element.owner._id,
        };
        return book1;
      });
    } catch (err) {
      return next(new HttpError("Could not show books , try again", 500));
    }
  } else {
    try {
      books = await Book.find({
        branch: branchName,
        semester: semesterNo,
        owner: { $not: { $eq: id } },
      }).populate("owner");
      

      dashboardBooks = books.map((element) => {
        let book1 = {
          id: element._id,
          name: element.name,
          author: element.author,
          image: element.image,
          description: element.description,
          semester: element.semester,
          subject: element.subject,
          ownerName: element.owner.name,
          branch: element.branch,
          owner: element.owner._id,
        };
        return book1;
      });
    } catch (err) {
      return next(new HttpError("Could not show books , try again", 500));
    }
  }
  return res.json(dashboardBooks);
};

module.exports.addBook = addBook;
module.exports.myBooks = myBooks;
module.exports.dashboard = dashboard;
module.exports.filterBooks = filterBooks;
module.exports.book = book;
