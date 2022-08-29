class ShelfDatabase {
  //initializing the database connection
  constructor() {
    this.mysql = require('mysql');
    this.util = require('util');
    this.async = require('async');
    this.dbUsername = process.env.dbUsername;
    this.dbPassword = process.env.dbPassword;
    this.dbName = process.env.dbName || 'deep_search';
    this.conn = this.mysql.createConnection({
      host: 'localhost',
      user: this.dbUsername,
      password: this.dbPassword,
      database: this.dbName,
    });
    this.conn.connect();
  }

  //promisify the callback func
  convertToPromise(func) {
    return this.util.promisify(func).bind(this.conn);
  }

  // query about author (all)
  async authorQuery() {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery('SELECT * from author');
      return result;
    } catch (error) {
      return Error('error in author query');
    }
  }

  // query about author (specific)
  async authorInfo(id) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `select * from author natural join period where aid="${id}"`
      );
      return result;
    } catch (error) {
      throw Error('error in authorInfo Function');
    }
  }

  //method to write author details to database
  async writeAuthorDetail(aname, nat, dob, death, pid) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `insert ignore into author(author_name,nationality,pid,dob,death) values("${aname}","${nat}","${pid}","${dob}","${death}")`
      );
      return 'success';
    } catch (error) {
      console.log(error);
      throw Error('error in writeAuthorDetail function');
    }
  }

  //method to write book details to database
  async writeBookDetail(aid, pid, title, pages, year) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `insert ignore into book(aid,title,pages,pid,year) values("${aid}","${title}","${pages}","${pid}","${year}")`
      );
    } catch (error) {
      console.log(error);
      throw Error('Error in write BookDetail function');
    }
  }

  //method to get author id by name
  async getAuthorid(aname) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `select aid from author where author_name="${aname}"`
      );
      console.log(result);
      //if result is null means that author data is not there
      if (result.length == 0) {
        return null;
      }
      return result[0].aid;
    } catch (error) {
      console.log(error);
      throw Error('Error in getAuthorid function');
    }
  }

  //query to add period deatils and give inserted eras id
  async writePeriod(era) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `insert ignore into period(era) values("${era}")`
      );
      let pid = result.insertId;
      if (pid == 0) {
        pid = await this.getPeriodId(era);
      }
      return pid;
    } catch (error) {
      throw Error('Error in writeperiod function');
    }
  }

  //query period table to get id
  async getPeriodId(era) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `select pid from period where era="${era}"`
      );
      return result[0].pid;
    } catch (error) {
      throw Error('error in getPeriodId function');
    }
  }

  //query about all books by specific author
  async allBooksByAuthor(id) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `select * from book where aid=${id}`
      );
      return result;
    } catch (error) {
      throw Error('error in allBooksByAuthor Function');
    }
  }

  //query about books
  async bookQuery() {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery('SELECT * from book');
      return result;
    } catch (error) {
      return Error('error in book query');
    }
  }

  //query about getting specific book by its id
  async getSpecificBook(bno) {
    const promisifiedQuery = this.convertToPromise(this.conn.query);
    try {
      const result = await promisifiedQuery(
        `select * from book cross join author on author.aid=book.aid where bno="${bno}"`
      );
      return result;
    } catch (error) {
      throw Error('error in getSpecificBook method');
    }
  }

  //used to end the connection
  endConn() {
    this.conn.end();
  }
}

module.exports = ShelfDatabase;
