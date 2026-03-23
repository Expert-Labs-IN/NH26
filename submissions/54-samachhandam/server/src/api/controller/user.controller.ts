import UserService from "@/service/user.service";
import { Request, Response } from "express";

export const getAllDrivers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllDrivers();
        res.status(200).json({
            success: true,
            message: "Drivers fetched successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch drivers",
        });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch users",
        });
    }
};
