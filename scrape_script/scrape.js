'use strict';
//creating a class

class scrapePdf {
  constructor(pdfpath, pdfname) {
    this.pdfFilePath = pdfpath;
    this.pdfname = pdfname;
    this.fs = require('fs');
    this.pageText = '';
    this.pageNum = -1;
    this.jsonData = {
      status: 'success',
      data: {
        bookName: `${this.pdfname}`,
        word_data: {},
      },
    };
  }

  //next method to check the log file
  checklog() {
    const logs = this.fs.readFileSync(`${__dirname}/scrapeLog.txt`, 'utf-8');
    if (!logs.includes(this.pdfname)) {
      this.extractText();
    } else {
      console.log('file has already been scanned.');
    }
  }

  //save it in to a log file
  writelog() {
    this.fs.appendFileSync(`${__dirname}/scrapeLog.txt`, this.pdfname);
  }

  //extract all the text contents
  extractText() {
    const PdfParser = require('pdf2json');

    let pdfParser = new PdfParser(this, 1);

    pdfParser.on('pdfParser_dataError', (errData) =>
      console.error(errData.parserError)
    );
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      this.fs.writeFile(
        `${__dirname}/textfiles/${this.pdfname}.txt`,
        pdfParser.getRawTextContent(),
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('successfull');
            this.tojson();
          }
        }
      );
    });
    pdfParser.loadPDF(this.pdfFilePath);
  }

  tojson() {
    const readline = require('readline');
    let word_data = Object();
    let pageno = '-1';

    const rl = readline.createInterface({
      input: this.fs.createReadStream(
        `${__dirname}/textfiles/${this.pdfname}.txt`
      ),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (line.search(/(?<=-{16}Page \()(\d+)(?=\) Break-{16})/g) != -1) {
        word_data[`"${this.pageNum}"`] = `"${this.pageText}"`;
        let v = line.match(/(?<=-{16}Page \()(\d+)(?=\) Break-{16})/g);
        pageno = v[0];
        let pagenumInt = parseInt(pageno);
        this.pageNum = pagenumInt;
        this.pageText = '';
      } else {
        // console.log(pageno);
        line = line.replace(/^[, ]+|[, ]+$|[, ]+/g, ' ').trim();
        line = line.replace(',', '');
        line += ' ';
        if (pageno != '-1') {
          this.pageText += line;
        }
      }
    });

    rl.on('close', () => {
      this.jsonData.data.word_data = JSON.stringify(word_data);
      this.writelog();
      this.fs.writeFile(
        `${__dirname}/jsons/${this.pdfname}.json`,
        JSON.stringify(this.jsonData),
        (err) => {
          if (!err) {
            console.log('successfull');
          }
        }
      );
    });
  }
}

let r = new scrapePdf(`${__dirname}/pdfs/hp2.pdf`, 'hp2');
r.checklog();
