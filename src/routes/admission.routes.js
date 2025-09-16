import { Router } from "express";
import { applyForAdmission , approveAdmission,rejectAdmission,keepPending, fetchAdmissions} from "../controllers/adminssion.controllers.js";
import uploadDocsMiddleware from "../middleware/uploadDocs.middleware.js";
import {authMiddleware} from "../middleware/auth.middleware.js"



const admissionRouter = Router();

admissionRouter.post("/apply", uploadDocsMiddleware, applyForAdmission);
admissionRouter.put("/approve/:studentId", authMiddleware(["director"]), approveAdmission);
admissionRouter.put("/reject/:studentId",authMiddleware(["director"]) ,rejectAdmission);
admissionRouter.put("/pending/:studentId",authMiddleware(["director"]),keepPending);
admissionRouter.get("/all-admissions", authMiddleware(["director"]),fetchAdmissions);


export default admissionRouter;
