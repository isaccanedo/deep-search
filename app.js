const express = require('express');
const path = require('path');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const authorRouter = require('./routes/shelf').aRouter;
const bookRouter = require('./routes/shelf').bRouter;
const searchRouter = require('./routes/search');

const formRouter = require('./routes/forms');

const shelfDatabase = require('./db/shelfDb');

const app = express();

//routes
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// set the view engine to ejs
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

//setting static folder to serve js and css files
app.use(express.static(`${__dirname}/views/static`));
bookRouter.use(express.static(`${__dirname}/views/static`));
authorRouter.use(express.static(`${__dirname}/views/static`));
formRouter.use(express.static(`${__dirname}/views/static`));
searchRouter.use(express.static(`${__dirname}/views/static`));

//home page route
app.get('/', async (req, res) => {
  const db = new shelfDatabase();
  try {
    const allAuthors = await db.authorQuery();
    const allBooks = await db.bookQuery();
    return res.render('pages/index', {
      allAuthors: allAuthors,
      allBooks: allBooks,
      disp: 0,
    });
  } catch (error) {}
});

//using 3rd party middleware body-parser
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

//binding routes to router instances
app.use('/authors', authorRouter);
app.use('/books', bookRouter);
app.use('/search', searchRouter);
app.use('/forms', formRouter);

module.exports = app;
