import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const teacherRouter = express.Router();

// Director only access
teacherRouter.get("/teachers", authMiddleware(["director"]), getTeachers);
teacherRouter.get("/teachers/:id", authMiddleware(["director"]), getTeacherById);
teacherRouter.post("/teachers", authMiddleware(["director"]), createTeacher);
teacherRouter.patch("/teachers/:id", authMiddleware(["director"]), updateTeacher);
teacherRouter.delete("/teachers/:id", authMiddleware(["director"]), deleteTeacher);

export default teacherRouter;
