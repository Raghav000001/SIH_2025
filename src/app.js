import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

export  const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


//routes import 
import directorRouter from "./routes/director.routes.js";
import authRouter from "./routes/auth.routes.js";
import admissionRouter from "./routes/admission.routes.js";
import libraryRouter from "./routes/library.routes.js";
import hostelRouter from "./routes/hostel.routes.js";
import studentRouter from "./routes/student.routes.js";
import teacherRouter from "./routes/teacher.routes.js";



//routes decleration
app.use("/api/auth/v1/director/",directorRouter);
app.use("/api/auth/v1/",authRouter);
app.use("/api/library/v1",libraryRouter);
app.use("/api/admission/v1/",admissionRouter);
app.use("/api/hostel/v1/",hostelRouter);
app.use("/api/student/v1/",studentRouter);
app.use("/api/teacher/v1/",teacherRouter);



