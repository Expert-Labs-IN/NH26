import { Router } from "express";
import {
    createTask,
    getAllTasks,
    getTaskById,
    getTasksByDriver,
    updateTask,
    updateTaskStatus,
    assignTaskToDriver,
    deleteTask,
} from "../controller/task.controller";

const taskRouter = Router();

taskRouter.post("/", createTask);
taskRouter.get("/", getAllTasks);
taskRouter.get("/:taskId", getTaskById);
taskRouter.get("/driver/:userId", getTasksByDriver);
taskRouter.put("/:taskId", updateTask);
taskRouter.patch("/:taskId/status", updateTaskStatus);
taskRouter.patch("/:taskId/assign", assignTaskToDriver);
taskRouter.delete("/:taskId", deleteTask);

export default taskRouter;
