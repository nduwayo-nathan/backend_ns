import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { logAction } from "../utils/logger.js";
const prisma=new PrismaClient()

export const  register = async(req,res)=>{
const {name,email,password,role}=req.body;
try {
    if (!name||!email||!password) {
        return res.status(400).json({message:"Name, email, and password are required" })
    }

    const existingUser= await prisma.user.findUnique({
        where:{email},
    })
    
    if (existingUser) {
        return res.status(409).json({message:"User with this Email already registered."})
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword,
            role :role || "USER"
        }
    })
     await logAction(user.id, `Registered new user with email ${email}`);
    return res.status(200).json({
        message:"User registered successfully",
        user:user
    })

} catch (error) {
    console.log("Failed to register user")
    return res.status(500).json({message:"Interna server error ",error:error.message})
    
}
}




export const login =async(req,res)=>{
    const{email,password}=req.body
    try {
        if(!email||!password){
          return  res.status(400).json({message:"Email and password are required."})
        }
        const user = await prisma.user.findUnique({
            where:{email}
        })
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isPasswordValid= await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
             return res.status(401).json({ message: "Invalid email or password." });  
        }
        const token= jwt.sign(
            {id:user.id,role:user.role,email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        );
        await logAction(user.id, `Logged in with email ${email}`);
           return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        
    } catch (error) {
        console.log("Failed to Login user")
    return res.status(500).json({message:"Interna server error ",error:error.message})
     
    }
}

export const update =async(req,res)=>{
    const id= req.user.id
    const{name,email,password}=req.body;
    try {
       const existingUser=await prisma.user.findUnique({
        where:{id:id},
       });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const updateData={}

        if(name) updateData.name=name
        if (email) updateData.email = email;
        if(password){
            const hashedPassword= await bcrypt.hash(password,10);
            updateData.password=hashedPassword
        }

        const updatedUser= await prisma.user.update({
            where:{id:id},
            data:updateData
        })


     const updates = [];
    if (name) updates.push(`name: ${name}`);
    if (email) updates.push(`email: ${email}`);
    if (password) updates.push(`password: [changed]`);
    await logAction(id, `Updated profile: ${updates.join(", ")}`);
         return res.status(200).json({
            message: "User updated successfully.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });

    } catch (error) {
         console.log("Failed to update user")
    return res.status(500).json({message:"Interna server error ",error:error.message})
    }
}