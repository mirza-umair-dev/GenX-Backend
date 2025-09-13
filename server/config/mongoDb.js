import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDb = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Db connected");
    return conn;
}

export default connectDb;