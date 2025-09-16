import express from "express";
import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  addRoom,
  getHostelRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  allocateStudent,
  vacateStudent,
  getRoomStudents,
  getStudentHostel,
} from "../controllers/hostel.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const hostelRouter = express.Router();

/* -------------------- 1. Hostel CRUD -------------------- */
hostelRouter.post("/hostels", authMiddleware(["director"]) ,  createHostel);
hostelRouter.get("/hostels", authMiddleware(["director"]) , getHostels);
hostelRouter.get("/hostels/:id", authMiddleware(["director"]) , getHostelById);
hostelRouter.put("/hostels/:id", authMiddleware(["director"]) , updateHostel);
hostelRouter.delete("/hostels/:id", authMiddleware(["director"]) , deleteHostel);

/* -------------------- 2. Room Management -------------------- */
hostelRouter.post("/hostels/:id/rooms", authMiddleware(["director"]) , addRoom);
hostelRouter.get("/hostels/:id/rooms", authMiddleware(["director"]) , getHostelRooms);
hostelRouter.get("/rooms/:roomId", authMiddleware(["director"]) , getRoomById);
hostelRouter.put("/rooms/:roomId", authMiddleware(["director"]) , updateRoom);
hostelRouter.delete("/rooms/:roomId", authMiddleware(["director"]) , deleteRoom);

/* -------------------- 3. Student Room Allocation -------------------- */
hostelRouter.post("/rooms/:roomId/allocate", authMiddleware(["director","teacher"]) , allocateStudent);
hostelRouter.post("/rooms/:roomId/vacate", authMiddleware(["director"]) , vacateStudent);
hostelRouter.get("/rooms/:roomId/students", authMiddleware(["director"]) , getRoomStudents);
hostelRouter.get("/students/:id/hostel",authMiddleware(["director","student"]) , getStudentHostel);

export default hostelRouter;
