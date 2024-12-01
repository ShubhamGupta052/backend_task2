const jwt = require("jsonwebtoken");
const Users = require('./userSc');
require('dotenv').config();


 const validateToken = (async (req,res,next)=>{
    let token;
    let authHead = req.headers.authorization||req.headers.Authorization;
    if(authHead && authHead.startsWith("Bearer")){
        token = authHead.split(" ")[1];

        jwt.verify(token, process.env.JWT_SEC, async (err, decoded) => {
            if(err){
                console.error("JWT Verification Error:",err);
               return res.status(401).json({message:"User is not authorized"});
            }
            req.user = decoded;
            console.log(decoded);
            next();
        });
    }
 
   if(!token){
    res.status(401).json({message:"Token is not generated"});
   }
});
 module.exports = validateToken;
 