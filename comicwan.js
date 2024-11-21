const mongoose = require('mongoose');//Calls the mongoDB to the program

const comicS = new mongoose.Schema({
  Name: { type: String, required: [true, 'Name is required'] },
  Author: { type: String, required: [true,'Author name is required'] },
  Year: { type: Number, required: [true, 'Year is required'], min:[1900,'Year must be after 1900'] },
  Price: { type: Number, required: [true,'Price is required'],min:[0,'Price must be a positve nnumber'] },
  Pages: { type: Number, required: [true,'Pages is required'],min:[0,'Pages must be a positve nnumber' ]},
  Condition: { type: String, enum: ['new', 'used'], required: [true, 'Condition is required'] },
});

module.exports = mongoose.model('Comic', comicS,'manga');
