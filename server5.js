const express = require('express');
const mongoose = require('mongoose');
const comicwave = require('./comicwave'); 
//There are used for importing the library in our program

const app = express(); 
const PORT = 4000;   //Gives the port number


const dbURI = 'mongodb://localhost:27017/Comix-stor'; //TAkes us to the database

mongoose.connect(dbURI)
  .then(() => 
    console.log('MongoDB connected successfully'))
  .catch((err) => 
    console.error('MongoDB connection error:', err)); //checks wheather the connection is stablised or not.

app.use(express.json());  // tells the program that the file is in json format

app.use("/api/user", require('./userAuth'));

app.use('/api/manga',comicwave);


app.listen(PORT, () => 
  console.log(`Server is running on http://localhost:${PORT}`));

//This Starts the server.