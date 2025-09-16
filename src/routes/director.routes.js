
import { Router } from "express";
import { registerDirector } from "../controllers/director.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const directorRouter = Router();

directorRouter.post("/register",authMiddleware(["director"]),registerDirector)


export default directorRouter;