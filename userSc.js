const mongoose = require('mongoose');//Calls the mongoDB to the program

const userS = new mongoose.Schema(
  {
  Name: { type: String, required: [true, 'Name is required'] },
  Email: { type: String, required: [true,'Email is required'] },
  Password: { type: String, required: [true, 'Password is required'] },
  Role: { type: String, enum: ['Manager','Admin','User'], required: [true, 'Status is required'], default:'User' },
  Otp: { type: String }, // Stores the OTP
    OtpExpiration: { type: Date }, // Expiration time for the OTP
},
  {timestamps: true }
);

//module.exports = mongoose.model('Users', userS,'userInfo');
const Users = mongoose.model('userInfo', userS,'userInfo');
module.exports = Users;
