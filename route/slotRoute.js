import express from "express"
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { bulkCreateSlots, createSlot, deleteSlot, listSlots, updateSlot } from "../controller/slotController.js";
const router=express.Router()
router.post("/create/bulk", verifyToken, verifyAdmin, bulkCreateSlots);
router.post("/create", verifyToken, verifyAdmin, createSlot);
router.put("/:id", verifyToken, verifyAdmin, updateSlot);
router.delete("/:id", verifyToken, verifyAdmin, deleteSlot);
router.get("/", verifyToken, listSlots);
router.get("/:search",verifyToken,)

export default router;