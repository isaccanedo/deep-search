const express = require('express');

const frouter = express.Router();

//its just simple serving html route
frouter.route('/addAuthor').get((req, res) => {
  res.render('pages/addAuthor', {});
});

frouter.route('/addBook').get((req, res) => {
  res.render('pages/addBook', {});
});

module.exports = frouter;
