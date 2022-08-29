const { validationResult } = require('express-validator');
const shelfDatabase = require('../db/shelfDb');
const db = new shelfDatabase();

/*---------Author--------*/
//handler for GET allAuthor route
exports.getAllAuthors = (req, res) => {
  const r = db.authorQuery();

  r.then((data) => {
    db.endConn();
    return res.status(200).json(data);
  }).catch((err) => {
    db.endConn();
    return res.status(500).end('server error');
  });
};

//handler for POST addAuthor route
exports.addAuthor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    console.log(req.body);
    const authorName = req.body.authorName;
    const nationality = req.body.nationality;
    const dob = req.body.dob || '1828-08-09';
    const death = req.body.death || '1828-08-09';
    const era = req.body.era || 20; //default is 20th century

    //handling file upload here
    if (req.files || Object.keys(req.files).length != 0) {
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let profilePic = req.files.profilePic;
      let path = `${__dirname}/../views/static/img/${profilePic.name}`;

      // Use the mv() method to place the file somewhere on your server
      profilePic.mv(path, function (err) {
        if (err) console.log(err);
        else console.log('file stored in desired location');
      });
    }

    const pid = await db.writePeriod(parseInt(era));
    const result = await db.writeAuthorDetail(
      authorName,
      nationality,
      dob,
      death,
      pid
    );
    const baseAddr = process.env.baseAdress;
    return res.redirect(301, `${baseAddr}/`);
  } catch (error) {
    console.log(error);
    return res.status(500).send('error while adding author data');
  }
};

exports.getSpecificAuthor = async (req, res) => {
  const id = parseInt(req.query.id);
  const authorInfo = await db.authorInfo(id);
  const allBooksByAuthor = await db.allBooksByAuthor(id);
  console.log(authorInfo, allBooksByAuthor);
  res.status(200).render('pages/author', {
    authorInfo: authorInfo,
    allBooksByAuthor: allBooksByAuthor,
  });
};

/*---------Books--------*/
//handler for GET allBooks route
exports.getAllBooks = (req, res) => {
  const r = db.bookQuery();

  r.then((data) => {
    db.endConn();
    return res.status(200).json(data);
  }).catch((err) => {
    return res.status(500).end('server error');
  });
};

//handler for POST addBook route
exports.addBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const bookTitle = req.body.bookTitle;
    const noPages = req.body.noPages;
    const rYear = req.body.rYear || '1828-08-09'; //default published year
    const era = req.body.era || 20; //default is 20th century
    const authorName = req.body.authorName;

    //handling file upload here
    if (req.files || Object.keys(req.files).length != 0) {
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let bookPic = req.files.bookPic;
      let bookPdf = req.files.bookPdf;
      let imgPath = `${__dirname}/../views/static/img/${bookPic.name}`;
      let bookPath = `${__dirname}/../views/static/pdf/${bookPdf.name}`;

      // Use the mv() method to place the file somewhere on your server
      bookPic.mv(imgPath, function (err) {
        if (err) console.log(err);
        else console.log('file stored in desired location');
      });
      bookPdf.mv(bookPath, function (err) {
        if (err) console.log(err);
        else console.log('file stored in desired location');
      });
    }

    const pid = await db.writePeriod(parseInt(era));
    const aid = await db.getAuthorid(authorName);
    if (!aid) {
      //author data is missing in the database
      return res
        .status(500)
        .end('Author Data is missing. Fill the author data first');
    }
    const result = await db.writeBookDetail(
      aid,
      pid,
      bookTitle,
      noPages,
      rYear
    );

    const baseAddr = process.env.baseAdress;
    return res.redirect(301, `${baseAddr}/`);
  } catch (error) {
    console.log(error);
    return res.status(500).send('error while adding book data');
  }
};

exports.getSpecificBook = async (req, res) => {
  //getting the perticular id of the book using query
  const bno = parseInt(req.query.bno);
  const bookInfo = await db.getSpecificBook(bno);
  console.log(bookInfo);

  return res.status(200).render('pages/book', {
    bookInfo: bookInfo,
  });
};
