import express from "express";
import { createOrder, verifyPayment } from "../controllers/payments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const paymentRouter = express.Router();

// Only students should hit these
paymentRouter.post("/order", authMiddleware(["student"]), createOrder);
paymentRouter.post("/verify", authMiddleware(["student"]), verifyPayment);

export default paymentRouter;
