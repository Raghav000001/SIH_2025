import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const studentRouter = express.Router();

studentRouter.get("/students", authMiddleware(["director"]), getStudents);
studentRouter.get("/students/:id", authMiddleware(["director"]), getStudentById);
studentRouter.put("/students/:id", authMiddleware(["director"]), updateStudent);
studentRouter.delete("/students/:id", authMiddleware(["director"]), deleteStudent);


export default studentRouter;
