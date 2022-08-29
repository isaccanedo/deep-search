const dotenv=require('dotenv');
dotenv.config({
    path:'./config.env'
});

//i want load the env variables before getting app instance
const app=require('./app');


const portno= process.env.PORT || 3000;
app.listen(portno,()=>{
    console.log('server has started');
});