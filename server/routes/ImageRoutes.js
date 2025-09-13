import express from "express";
import generateImage from "../controllers/imageController.js";
import protect from "../middleware/authMiddleware.js";
const imageRouter = express.Router();

imageRouter.post("/generate-image",protect, generateImage);

export default imageRouter;
