import express from "express";
import { registerUser, loginUser, getProfile, verifyOtp, resetOtp, resetPassword, verifyResetOtp, } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile",protect, getProfile);
router.post("/verify",protect,verifyOtp);
router.post("/reset-otp",resetOtp);
router.post("/reset-password",resetPassword)
router.post("/verify-reset-otp",verifyResetOtp)
export default router;
