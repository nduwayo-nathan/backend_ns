import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifyToken =(req,res,next)=>{
    const authHeader=req.headers.authorization

    if (!authHeader||!authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ message: "Access denied. No token provided." }); 
        
    }

    const token=authHeader.split(" ")[1];
    try {
        const decode= jwt.verify(token,process.env.JWT_SECRET,);
        req.user=decode
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid token." });
        } else {
            return res.status(500).json({ message: "Token verification failed." });
        } 
    }

}
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};
