import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { addVehicle, deleteVehicle, listVehicles, updateVehicle } from "../controller/vehicleController.js";

const router = express.Router();

router.post("/add", verifyToken,addVehicle);
router.put("/:id", verifyToken, updateVehicle);
router.delete("/:id", verifyToken,deleteVehicle);
router.get("/", verifyToken, listVehicles);

export default router;
