import express from "express";


import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { createSlotRequest, deleteSlotRequest, handleRequestApproval, listRequests, updateSlotRequest } from "../controller/slotRequestController.js";

const router = express.Router();

router.post("/request", verifyToken,createSlotRequest);
router.put("/:id", verifyToken,updateSlotRequest);
router.delete("/:id", verifyToken,deleteSlotRequest);
router.post("/:id/approve", verifyToken,verifyAdmin, handleRequestApproval);
router.get("/", verifyToken,listRequests);

export default router;
