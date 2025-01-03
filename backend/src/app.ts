import { CoursePurchase } from './models/coursePurchaseModel';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import user from "./routes/userRoute"
import course from "./routes/courseRoute"
import coursePurchase from "./routes/coursePurchaseRoute"
import courseProgress from "./routes/courseProgressRoute"
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cookieParser());
connectDB();

const corsOptions ={
    origin: "*",
    credentials:true,
}
app.use(cors(corsOptions));

app.use("/api/v1", user);
app.use("/api/v1", course);
app.use("/api/v1", coursePurchase);
app.use("/api/v1", courseProgress);

export default app;
