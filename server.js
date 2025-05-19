import express from "express";
import dotenv from "dotenv"
import userRoute from "./route/userRoute.js"
import slotRoute from "./route/slotRoute.js"
import vehicleRoute from "./route/vehicleRoute.js"
import slotRequestRoute from "./route/slotRequestRoute.js"
import cors from "cors";


const app=express()
const PORT = process.env.PORT || 3000
dotenv.config();
app.use(cors({
  origin: "http://localhost:8080", 
  credentials: true,
}));


app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Welcome here")
})
app.use("/user",userRoute)
app.use("/slots",slotRoute)
app.use("/vehicle",vehicleRoute)
app.use("/user/slot",slotRequestRoute)



app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})