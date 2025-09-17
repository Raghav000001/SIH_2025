import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/feeStructure.controller.js";

const feeStructureRouter = express.Router();


feeStructureRouter.post("/fee-structure",authMiddleware(["director"]) , createFeeStructure);
feeStructureRouter.get("/fee-structure",authMiddleware(["director"]) , getFeeStructures);
feeStructureRouter.get("/fee-structure/:id",authMiddleware(["director"]),getFeeStructureById);
feeStructureRouter.put("/fee-structure/:id",authMiddleware(["director"]),updateFeeStructure);
feeStructureRouter.delete("/fee-structure/:id",authMiddleware(["director"]),deleteFeeStructure);

export default feeStructureRouter;