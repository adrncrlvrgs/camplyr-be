import { Request, Response, NextFunction } from "express";
import {verifyToken} from "../utils/jwt.utils"

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth  = (
   req: Request,
   res: Response,
   next: NextFunction 
): void => {
    const token = req.cookies?.token

    if(!token){
         res.status(401).json({
            message: "No Access token"
        });
    }

    try{
        const decoded =  verifyToken(token);
        req.user = decoded;

        next();

    }catch(err){
         res.status(401).json({ error: "Invalid or expired token" });
    }
}