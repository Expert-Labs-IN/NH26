import IUser from "@/types/interface/user.interface";
import { Request, Response, NextFunction } from "express";

const roleBasedAuth = (allowedRoles: IUser["role"][]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user; // Assuming user info is attached to req.user by previous middleware
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user information" });
        }
        if (!allowedRoles.includes(user.role as IUser["role"])) {
            return res.status(403).json({ success: false, message: "Forbidden: You do not have access to this resource" });
        }
        next();
    };
}

export default roleBasedAuth;