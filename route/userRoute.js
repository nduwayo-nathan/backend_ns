import express from "express"
import {login, register, update} from "../controller/userController.js"
import { verifyToken } from "../middleware/auth.js"

const router=express.Router()

router.post("/auth/register",register)
router.post("/auth/login",login)
router.put("/auth/update",verifyToken,update)
router.get('/auth/validate', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});


export default router;