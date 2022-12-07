const HttpError = require("../models/http-error");
const User =    require("../models/user-model");

const AuthenticationFirst = async (req,res,next)=>{
   
    const tokenUserId = req.userData;
    let existingUser;
    try{
        existingUser = await User.findById(tokenUserId);
   }catch(err)
   {
       return next(new HttpError("Authorization failed",402));
   };
   if(!existingUser)
   {
       return next(new HttpError("Authorization failed",402));
   }

   req.existingUser = existingUser;

   next();

}

module.exports = AuthenticationFirst;