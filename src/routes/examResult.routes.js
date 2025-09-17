import express from "express";
import {
  uploadMarks,
  getStudentResult,
  downloadStudentResult,
} from "../controllers/examResult.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const examResultRouter = express.Router();

examResultRouter.post("/marks",authMiddleware(["director","teacher"]), uploadMarks);
examResultRouter.get("/student/:studentId",authMiddleware(["director","teacher","student"]), getStudentResult);
examResultRouter.get("/result/:studentId/download",authMiddleware(["director","teacher","student"]), downloadStudentResult);

export default examResultRouter;
