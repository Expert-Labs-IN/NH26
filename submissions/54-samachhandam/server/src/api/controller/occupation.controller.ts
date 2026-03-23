import OccupationService from "@/service/occupation.service";
import { IOcupation } from "@/types/interface/occupation.interface";
import { Request, Response } from "express";

export const createOccupation = async (req: Request, res: Response) => {
    try {
        const { description, name } = req.body as IOcupation || {}
        console.log(description)
        const result = await OccupationService.createOccupation({ description, name })
        res.status(201).json({
            success: true,
            message: "Occupation created successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create occupation",
        })
    }
}


export const getAllOccupations = async (req: Request, res: Response) => {
    try {
        const result = await OccupationService.getAllOccupations()
        res.status(200).json({
            success: true,
            message: "Occupations retrieved successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to retrieve occupations",
        })
    }
}

export const updateOccupation = async (req: Request, res: Response) => {
    try {
        const { occupationId } = req.params as { occupationId: string }
        const updateData = req.body as Partial<IOcupation>
        const result = await OccupationService.editOccupation(occupationId, updateData)
        res.status(200).json({
            success: true,
            message: "Occupation updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update occupation",
        })
    }
}

export const deleteOccupation = async (req: Request, res: Response) => {
    try {
        const { occupationId } = req.params as { occupationId: string }
        const result = await OccupationService.deleteOccupation(occupationId)
        res.status(200).json({
            success: true,
            message: "Occupation deleted successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to delete occupation",
        })
    }
}