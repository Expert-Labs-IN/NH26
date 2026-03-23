import TaskService from "@/service/task.service"
import ITask from "@/types/interface/task.interface"
import { Request, Response } from "express"

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, assignedTo, dueDate, status } = req.body as Partial<ITask>
        const result = await TaskService.createTask({ title, description, imageUrl, assignedTo, dueDate, status })
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create task",
        })
    }
}

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const result = await TaskService.getAllTasks()
        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch tasks",
        })
    }
}

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId
        const result = await TaskService.getTaskById(taskId)
        res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch task",
        })
    }
}

export const getTasksByDriver = async (req: Request, res: Response) => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
        const result = await TaskService.getTasksByDriver(userId)
        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch tasks",
        })
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId
        const updates = req.body as Partial<ITask>
        const result = await TaskService.updateTask({ _id: taskId, ...updates })
        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update task",
        })
    }
}

export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId
        const { status } = req.body
        const result = await TaskService.updateTaskStatus({ _id: taskId, status })
        res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update task status",
        })
    }
}

export const assignTaskToDriver = async (req: Request, res: Response) => {
    try {
        const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId
        const { assignedTo } = req.body
        const result = await TaskService.assignTaskToDriver({ _id: taskId, assignedTo })
        res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to assign task",
        })
    }
}

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId
        const result = await TaskService.deleteTask(taskId)
        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to delete task",
        })
    }
}
