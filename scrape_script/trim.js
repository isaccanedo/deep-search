'use strict';
const fs=require('fs/promises')

const trim=(fname)=>{
    fs.readFile(fname)
    .then((data)=>{
        data = data.replace('', '');
        fs.writeFile('')
    })
}


module.exports=trim;