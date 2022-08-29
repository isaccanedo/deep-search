const searchDatabase = require('../db/searchDb');
const db = new searchDatabase();
const fs = require('fs');

exports.getWordContext = (req, res) => {
  const queryText = req.body.text;
  console.log(queryText);
  if (queryText.length == 0) {
    return res.status(200).end('No text was sent');
  }
  db.queryTextInDb(queryText)
    .then((data) => {
      return res.status(200).render('pages/searchresult', { sresults: data });
    })
    .catch((err) => {
      return res.status(500).end('Error happened in server');
    });
};

exports.writeTextToDb = (req, res) => {
  const scrapeData = req.body;
  const bookName = scrapeData.data.bookName;
  const wordData = scrapeData.data.wordData;

  //                    --------------  Earlier method ----------------
  // db.writeScrapedData(bookName, wordData)
  //   .then((data) => {
  //     console.log(data);
  //     return res.status(200).end('success');
  //   })
  //   .catch((err) => {
  //     return res.status(404).end('failed');
  //   }

  const { fork } = require('child_process');

  //forking a child process
  const writingToDbChildProcess = fork(`${__dirname}/childProcess.js`);

  //sending the text thorugh message
  writingToDbChildProcess.send([bookName, wordData]);

  //regestering a callback which gets executed after child process sends a msg
  writingToDbChildProcess.on('message', (msg) => {
    var datetime = new Date();
    const logEntry = `written successfully on - ${
      datetime.toISOString().slice(0, 10) +
      '    Time : ' +
      datetime.getHours() +
      ' : ' +
      datetime.getMinutes() +
      ' : ' +
      datetime.getSeconds()
    }\n`;
    console.log(logEntry);
    fs.appendFile(`${__dirname}/../logs/entryForDb.txt`, logEntry, (err) => {
      if (err) {
        console.log(
          'error happened while appending to log file and the error is : ',
          err
        );
      }
    });
  });

  res.status(200).end('process is started successfully');
};
