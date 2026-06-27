import { Request, Response, NextFunction } from "express";
import {verifyToken} from "../utils/jwt.utils"

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const verifyIdToken = (
   req: Request,
   res: Response,
   next: NextFunction 
)=>{
    const token = req.cookies?.token

    if(!token){
        return res.status(401).json({
            message: "No Access token"
        });
    }

    try{
        const decoded =  verifyToken(token);
        req.user = decoded;

        next();

    }catch(err){
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}