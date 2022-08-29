const express = require('express');
const { check } = require('express-validator');
const {
  getAllAuthors,
  addAuthor,
  getAllBooks,
  addBook,
  getSpecificAuthor,
  getSpecificBook,
} = require('../controllers/shelfController');

//creating author route instance
const aRouter = express.Router();

aRouter
  .route('/all')
  .get(getAllAuthors)
  .post(
    [
      check('authorName')
        .isString()
        .withMessage('author name has to be a string')
        .isLength({ min: 1 })
        .withMessage('author name cant be empty'),
      check('dob').isDate().withMessage('date of birth has to be date'),
    ],
    addAuthor
  );

aRouter.route('/specific').get(getSpecificAuthor);

//creating author route instance
const bRouter = express.Router();

bRouter
  .route('/all')
  .get(getAllBooks)
  .post(
    [
      check('authorName')
        .isString()
        .withMessage('author name has to be a string')
        .isLength({ min: 1 })
        .withMessage('author name cant be empty'),
      check('bookTitle')
        .isString()
        .isLength({ min: 1 })
        .withMessage('bookTitle cant be empty'),
    ],
    addBook
  );

//router to get specific book
bRouter.route('/specific').get(getSpecificBook);

exports.aRouter = aRouter;
exports.bRouter = bRouter;
