import { CoursePurchase } from './models/coursePurchaseModel';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import user from "./routes/userRoute"
import course from "./routes/courseRoute"
import coursePurchase from "./routes/coursePurchaseRoute"
import courseProgress from "./routes/courseProgressRoute"
import dashboard from "./routes/dashboardRoute"
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database";
import path from "path"
import bodyParser from 'body-parser';

const app = express();
const DIRNAME = path.resolve()

dotenv.config();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_URL || `http://localhost:5173`];

const corsOptions = {
    origin: allowedOrigins, // Specify your frontend URL
    credentials: true
}
connectDB();
app.use(cors(corsOptions));

// const corsOptions ={
//     origin: "*",
//     credentials:true,
// }
// app.use(cors(corsOptions));

// const prodOrigins = process.env.ORIGIN_1 || ''; // Default to an empty string if it's undefined
// const devOrigins = "http://localhost:5173";
// const allowedOrigins = process.env.NODE_ENV === "production" ? prodOrigins : devOrigins;

// // Ensure `allowedOrigins` is an array of strings
// const allowedOriginsArray = typeof allowedOrigins === 'string'
//   ? allowedOrigins.split(',').map(origin => origin.trim())
//   : []; // If undefined, fallback to empty array

// app.use(cors({
//     origin: (origin, callback) => {
//         if (origin && allowedOriginsArray.includes(origin)) {
//             console.log("Origin allowed:", origin);
//             callback(null, true);
//         } else {
//             console.log("Origin not allowed:", origin);
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true, // This allows credentials (cookies, authorization headers, etc.)
//     methods: ["GET", "POST", "PUT", "DELETE"],
// }));

app.use("/api/v1", user);
app.use("/api/v1", course);
app.use("/api/v1", coursePurchase);
app.use("/api/v1", courseProgress);
app.use("/api/v1", dashboard);

app.use(express.static(path.join(DIRNAME, "/frontend/dist")))
app.use("*", (_,res) => {
    res.sendFile(path.resolve(DIRNAME, "frontend", "dist", "index.html"))
})

export default app;
