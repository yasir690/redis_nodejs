const express=require('express');
const dbConnect = require('./connectivity');
const UserRouters = require('./userrouter');
const bodyParser = require('body-parser');

const app=express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(UserRouters)

// Database connection
dbConnect().catch((err) => {
    console.error("Database connection failed:", err);
    throw new Error("Database connection failed");
  });
  

app.listen(4000,()=>{
    console.log('server is running at 4000 port');
    
})