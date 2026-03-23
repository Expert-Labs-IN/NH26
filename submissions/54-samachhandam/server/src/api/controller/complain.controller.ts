import ComplainService from "@/service/complain.service"
import IComplain from "@/types/interface/complain.interface"
import { Request, Response } from "express"

export const createComplain = async (req: Request, res: Response) => {
    try {
        const { complained_by, description, priority, coordinates, status, category, title } = req.body as IComplain || {}
        const result = await ComplainService.createComplain({ complained_by, description, coordinates, status, category, priority, title })
        res.status(201).json({
            success: true,
            message: "Complain created successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create complain",
        })
    }
}

export const getAllComplains = async (req: Request, res: Response) => {
    try {
        const result = await ComplainService.getAllComplains()
        res.status(200).json({
            success: true,
            message: "Complains fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch complains",
        })
    }
}

export const getComplainById = async (req: Request, res: Response) => {
    try {
        const complainId = Array.isArray(req.params.complainId) ? req.params.complainId[0] : req.params.complainId
        const result = await ComplainService.getComplainById(complainId)
        res.status(200).json({
            success: true,
            message: "Complain fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch complain",
        })
    }
}

export const getComplainsByUser = async (req: Request, res: Response) => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
        const result = await ComplainService.getComplainsByUser(userId)
        res.status(200).json({
            success: true,
            message: "Complains fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch complains",
        })
    }
}

export const getComplainsByFilter = async (req: Request, res: Response) => {
    try {
        const { status, complained_by, startDate, endDate } = req.query
        const filter: Partial<IComplain> = {}
        if (status) filter.status = status as any
        if (complained_by) filter.complained_by = complained_by as any

        const dateRange = startDate && endDate ? { start: new Date(startDate as string), end: new Date(endDate as string) } : undefined

        const result = await ComplainService.getComplainsByFilter(filter, dateRange)
        res.status(200).json({
            success: true,
            message: "Complains fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch complains",
        })
    }
}

export const updateComplainStatus = async (req: Request, res: Response) => {
    try {
        const complainId = Array.isArray(req.params.complainId) ? req.params.complainId[0] : req.params.complainId
        const { status } = req.body
        const result = await ComplainService.updateComplainStatus({ _id: complainId as any, status })
        res.status(200).json({
            success: true,
            message: "Complain status updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update complain status",
        })
    }
}

export const deleteComplain = async (req: Request, res: Response) => {
    try {
        const complainId = Array.isArray(req.params.complainId) ? req.params.complainId[0] : req.params.complainId
        const result = await ComplainService.deleteComplain(complainId)
        res.status(200).json({
            success: true,
            message: "Complain deleted successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to delete complain",
        })
    }
}

export const acceptComplain = async (req: Request, res: Response) => {
    try {
        const complainId = Array.isArray(req.params.complainId) ? req.params.complainId[0] : req.params.complainId
        const workerId = req.user?.userId as string
        const { time } = req.body
        const result = await ComplainService.acceptComplain({
            complainId,
            time,
            workerId
        })
        res.status(200).json({
            success: true,
            message: "Complain accepted successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to accept complain",
        })
    }
}