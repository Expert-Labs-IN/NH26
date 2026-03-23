import AuthService from "@/service/auth.service"
import WorkerService from "@/service/worker.service"
import IUser from "@/types/interface/user.interface"
import { IWorker } from "@/types/interface/worker.interface"
import { Request, Response } from "express"
import { Types } from "mongoose"
import { ROLE } from "@/constants/role.constant"

export const login = async (req: Request, res: Response) => {
    try {
        const { mobile, password } = req.body
        const result = await AuthService.login({ mobile, password })
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Login failed",
        })
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body)
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Registration failed",
        })
    }
}

export const registerWorker = async (req: Request, res: Response) => {
    try {
        const { 
            occupation_object_id, 
            working_days, 
            email, 
            mobile, 
            password, 
            location, 
            start_time, 
            end_time, 
            name, 
            role 
        } = req.body as IWorker & IUser || {}

        // Ensure we pass the role (defaulting to WORKER if not specified)
        const user = await AuthService.register({ 
            name, 
            email, 
            mobile, 
            password, 
            role: role || ROLE.WORKER 
        })

        const result = await WorkerService.createWorker({ 
            occupation_object_id, 
            working_days, 
            user_object_id: user.user._id as unknown as Types.ObjectId, 
            location, 
            start_time, 
            end_time 
        });

        res.status(201).json({
            success: true,
            message: "Worker registration successful",
            data: user,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Worker registration failed",
        })
    }
}