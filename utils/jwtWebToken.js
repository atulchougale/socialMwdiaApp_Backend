const jwt = require('jsonwebtoken');

const jwtToken = (userId , res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
    res.cookie('jwt',token,{
        maxAge: 30 *24 *60 *60 *1000,
        httpOnly:true,
        
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict", // Adjust based on your environment
        secure:process.env.SECURE === "development"

    })
}

module.exports= jwtToken;