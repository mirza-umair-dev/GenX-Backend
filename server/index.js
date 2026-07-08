import express from "express";
import cors from "cors";
import connectDb from "./config/mongoDb.js";
import authRoutes from './routes/authRoutes.js'
import imageRouter from "./routes/ImageRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});
connectDb().then(() => {
    app.listen(PORT, () => {
        console.error(`Server is running on port ${PORT}`);
    });
}).catch(() => {
    console.error("Mongo Db connection failed");
})
app.use('/api/auth',authRoutes)
app.use('/api/image',imageRouter)
app.use('/',imageRouter)
