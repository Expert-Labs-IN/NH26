import JwtToken from "@/utils/jwtToken";
import { NextFunction, Request, Response } from "express";

const authCheck = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token format" });
    }
    try {
        const decoded = JwtToken.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
}

export default authCheck;