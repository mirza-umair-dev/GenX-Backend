import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import generateToken from "../utils/generateToken.js";
import transporter from "../utils/nodmailer.js";

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    const isExist = await User.findOne({ email });
    if (isExist) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    const token = generateToken(user._id);
    const sendOtp = async (user) => {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = Date.now() + 5 * 60 * 60 * 1000;
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        return otp;
    }
    const otp = await sendOtp(user);
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Verify Your Account",
        text: `Hello, your OTP is ${otp}. It will expire in 5 hours.`,
    }
    await transporter.sendMail(mailOptions);
    res.status(201).json(
        {
            success: true,
            name: user.name,
            email: user.email,
            id: user._id,
            CreditBalance: user.CreditBalance,
            token
        },
    )
    
    return user;

}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.status(200).json(
        {
            success: true,
            name: user.name,
            email: user.email,
            id: user._id,
            CreditBalance: user.CreditBalance,
            token
        });
}

export const getProfile = async (req, res) => {
    const user = req.user;
    res.status(200).json({ user })
}
export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
        name: user.name,
        email: user.email,
        id: user._id,
        CreditBalance: user.CreditBalance,
        token
    })
}


export const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const user = req.user;
    if (!otp) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.otpExpiry < Date.now()) {
        return res.status(400).json({ success: false, message: "OTP expired" });
    }
    user.isVerified = true;
    user.otp = 0;
    user.otpExpiry = 0;
    await user.save();
    res.status(200).json({ success: true, message: "User verified successfully" });
}
export const verifyResetOtp = async (req, res) => {
    const { email,resetOtp } = req.body;
    const user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({ success: false, message: "User not found!" });
    }
    if (!resetOtp) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    if (user.resetOtp !== resetOtp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpiry < Date.now()) {
        return res.status(400).json({ success: false, message: "Reset OTP expired" });
    }
    user.isVerified = true;
    user.resetOtp = 0;
    user.resetOtpExpiry = 0;    
    await user.save();
    res.status(200).json({ success: true, message: "User reset OTP verified successfully" });
}
export const resetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email not found!" });
    }
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }
        const token = generateToken(user._id);

        const sendResetOtp = async (user) => {
            const resetOtp = Math.floor(1000 + Math.random() * 9000);
            const resetOtpExpiry = Date.now() + 5 * 60 * 60 * 1000;
            user.resetOtp = resetOtp;
            user.resetOtpExpiry = resetOtpExpiry;
            await user.save();
            return resetOtp;
        }
        const resetOtp = await sendResetOtp(user);
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Reset Your Password",
            text: `Your password reset otp is ${resetOtp} . Don't forward to anyone`
        }
        await transporter.sendMail(mailOptions);
       return res.status(201).json(
            {
                success: true,
                token,
                message: 'Your otp sent successfully!'
            })
    }
    catch (error) {
        return res.json({ success: false, message: "Internal server error!",error });
    }
}

export const resetPassword = async (req, res) => {
    const {email,newPassword } = req.body;
    const user = await User.findOne({email});
    if (!user) {
        return res.json({ success: false, message: "User not found!" });
    }
    if (!newPassword) {
        return res.json({ success: false, message: 'New password is required' })
    }

    try {
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Password Reset Successful",
            text: `Your password has been reset successfully. If you did not request this, please contact support.`
        }
        await transporter.sendMail(mailOptions);
        res.json({
            success: true,
        })

    } catch (error) {
        return res.json({ success: false, message: "Internal server error!",error });
    }

}