import User from "../models/User.js";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const generateImage = async (req,res) => {
    console.log("REQ BODY:", req.body);
    const {prompt} = req.body;
    if(!prompt){
        return res.status(400).json({ message: "Prompt is required" });
    }
    
    try {
        const user = await User.findById(req.user.id);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    if(user.CreditBalance < 1){
        return res.status(400).json({success:false,message:"Insufficient credits",CreditBalance:user.CreditBalance});
    }
    const formData = new FormData();
    formData.append("prompt",prompt);

    const {data} = await axios.post ('https://clipdrop-api.co/text-to-image/v1',formData,{
        headers:{
            "x-api-key":process.env.CLIPDROP_API_KEY,
        },
        responseType:"arraybuffer"
    }) 
    const Base64Image = Buffer.from(data,'binary').toString("base64");
    const resultImage = `data:image/png;base64,${Base64Image}`;

    await User.findByIdAndUpdate(user._id,{
        CreditBalance:user.CreditBalance - 1
    })
    return res.status(200).json({success:true,message:"Image generated successfully",CreditBalance:user.CreditBalance - 1,resultImage});
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success:false,message:"Internal server error"});
    }

}

export default generateImage;