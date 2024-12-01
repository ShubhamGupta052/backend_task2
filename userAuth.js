const express = require('express');
const Users = require('./userSc');
const validateToken = require('./validateToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

                const otpStore = new Map();

                const transporter = nodemailer.createTransport({
                    service: 'gmail', 
                    secure: true,
                    port: 465,   //Gmail generally operates on it.
                    auth: {
                        user: process.env.EMAIL,  // Email address through which email is sent (e.g., your email@gmail.com)
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });

                function generateOtp() {
                    return crypto.randomInt(100000, 999999).toString(); //Used to send a randon number as OTP.
                }

                async function sendOtp(email, otp) {
                    const mailOptions = {
                        from: process.env.EMAIL,  // My Email address
                        to: email,                // Email of the reciver
                        subject: 'Your OTP for Registration for the Comic Book Inventory',  // Subject of the mail
                        text: `Your OTP is: ${otp}. It will expire in 5 minutes.\n\nRegards,\nShubham Gupta\nOwner`  // Email body
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`OTP sent to email: ${email}`);
                        return true; // Simulate successful OTP send
                    } catch (error) {
                        console.error('Error sending OTP email:', error);
                        return false;
                    }
                }

router.post("/register",async (req,res,next) => {
    const {Name,Email, Password,Role} = req.body;
    try{
    if(!Name||!Password||!Email||!Role){
       return res.status(400).json({message:"All field are mandatory"});
    }
    const useraval = await Users.findOne({Email});
    if(useraval)
    {
        return res.status(400).json({message:"User already exists"});
    }

    const otp = generateOtp();
        otpStore.set(Email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Store OTP for 5 minutes
        const otpSent = await sendOtp(Email, otp);
        console.log("Generated OTP:", otp, "for Email:", Email);
        console.log("Stored OTP details:", otpStore.get(Email));
        if (!otpSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    return res.status(200).json({message:"OTP sent to the email. Verify to complete registration"});
    
}
    catch(err){
     next(err);
    }
});

   router.post("/register-otp", async (req,res,next) => {
    const {Name,Email, Password,Role,Otp} = req.body;
    try{
        if(!Name||!Otp||!Password||!Email||!Role){
            return res.status(400).json({message:"All field are mandatory"});
         }
    const storedOtp = otpStore.get(Email);
    console.log("Received Otp:", Otp);
    console.log("Current Time:", Date.now(), "Expiry Time:", storedOtp?.expiresAt);
    if (!storedOtp || storedOtp.otp !== Otp || storedOtp.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    otpStore.delete(Email); // Clear OTP after successful verification

    const hashpass = await bcrypt.hash (Password , 10);
    console.log("Hashed password:",hashpass);


    const userIn = await Users.create({
        Name,
        Password: hashpass,
        Email,
        Role
    });

    console.log("User created ${userIn}");
    if(userIn){
        return res.status(201).json({ _id: userIn._id, email: userIn.Email});
    }
  }
  catch(err){
    next(err);
  }
    res.json({message:"register the user"});
});

async function sendOtpV(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL,  // My Email address
        to: email,                // Email of the reciver
        subject: 'Your OTP for Verification for the Comic Book Inventory',  // Subject of the mail
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.\n\nRegards,\nShubham Gupta\nOwner`  // Email body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to email: ${email}`);
        return true; // Simulate successful OTP send
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
}


router.post("/login", async (req,res,next) => {
    const { Email,Password } = req.body;

    if(!Email||!Password){
        return res.status(400).json({message:"All fields are mandatory!"});
    }

    try{
     const user = await Users.findOne({Email});
     console.log("User from DB:", user);
     if(!user){
        console.log(user);
        return res.status(401).json({message:"User not Valid"});
     }
    
     const isPassword = await bcrypt.compare(Password, user.Password);
     

    if(!isPassword)
    {
        return res.status(401).json({message:"Password is not Diff"})
    }

    const otp = generateOtp();
    otpStore.set(Email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send OTP to user's email
    const otpSent = await sendOtpV(Email, otp);
    console.log("Generated OTP:", otp, "for Email:", Email);
    console.log("Stored OTP details:", otpStore.get(Email));

    if (!otpSent) {
        return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({ message: "OTP sent to your email. Verify to complete login." });
} catch (err) {
    next(err);
}
});

router.post("/login-otp", async (req, res, next) => {
    const { Email,Password, Otp } = req.body;

    if (!Email ||!Password||!Otp) {
        return res.status(400).json({ message: "All fields are mandatory!" });
    }

    try {
        const storedOtp = otpStore.get(Email);
        console.log("Received Otp:", Otp);
        console.log("Current Time:", Date.now(), "Expiry Time:", storedOtp?.expiresAt);

        if (!storedOtp || storedOtp.otp !== Otp || storedOtp.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP after successful verification
        otpStore.delete(Email);

        // Retrieve user to include in the token
        const user = await Users.findOne({ Email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const accessToken = jwt.sign({
            user: {
                Name: Users.Name,
                Email:Users.Email,
                id: Users._id,
            }
        }, process.env.JWT_SEC,{expiresIn:"5m"}
    );
       return res.status(200).json({message:"Login Successful",accessToken});
}   catch(err){
    next(err);
     }
});

router.post("/current",validateToken ,(req,res) => {
    res.json({ message: "Current user information"});
});

router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error
    return res.status(res.statusCode || 500).json({
        error: err.message || "Internal Server Error",
    });
});

module.exports = router;