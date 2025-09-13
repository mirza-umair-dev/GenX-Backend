import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name : {type:String,required:true},
    email : {type:String,required:true,unique:true,lowercase:true},
    password : {type:String,required:true},
    otp : {type:String},
    otpExpiry : {type:Date},
    isVerified : {type:Boolean,default:false},
    CreditBalance : {type:Number,default:5},
    resetOtp:{type:String},
    resetOtpExpiry:{type:Date}
})

const User = mongoose.model("User",userSchema);

export default User;