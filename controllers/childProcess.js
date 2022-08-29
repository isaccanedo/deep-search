const searchDatabase = require('../db/searchDb');
const db = new searchDatabase();

//defining a function which will be executed once the child gets instr form parent
const writeToDb = async (bookName, wordData) => {
  await db.writeScrapedData(bookName, wordData);
  process.send('child process finished');
};

//regestering a callback for receiving text from parent
process.on('message', (payload) => {
  const [bookName, wordData] = payload;
  writeToDb(bookName, wordData);
});
