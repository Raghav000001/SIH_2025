import express from "express";
import {
  createExamSchedule,
  getExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
} from "../controllers/examSchedule.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const examScheduleRouter = express.Router();

examScheduleRouter.post("/schedule",authMiddleware(["director"]), createExamSchedule);
examScheduleRouter.get("/schedule",authMiddleware(["director","teacher","student"]), getExamSchedules);
examScheduleRouter.get("/schedule/:id",authMiddleware(["director","teacher"]), getExamScheduleById);
examScheduleRouter.put("/schedule/:id",authMiddleware(["director"]), updateExamSchedule);
examScheduleRouter.delete("/schedule/:id",authMiddleware(["director"]), deleteExamSchedule);

export default examScheduleRouter;
