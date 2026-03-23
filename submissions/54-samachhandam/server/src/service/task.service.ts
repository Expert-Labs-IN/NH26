import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import { TASK_STATUS } from "@/constants/taskStatus.constant";
import complainModel from "@/models/complain/complain.model";
import taskModel from "@/models/task/task.model";
import ITask from "@/types/interface/task.interface";

class TaskService {
  static async createTask({
    status = "Pending",
    title,
    description,
    imageUrl,
    assignedTo,
    dueDate,
  }: ITask) {
    // Implement task creation logic
    if (!title) {
      throw new Error("Title is required");
    }
    try {
      const task = await taskModel.create({
        title,
        description,
        imageUrl,
        status,
        assignedTo,
        dueDate,
      });
      return task;
    } catch (error) {
      throw new Error("Failed to create task");
    }
  }

  static async getTasksByDriver(userId: string) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    try {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const tasks = await taskModel
        .find({ assignedTo: userId })
        .populate("assignedTo", "username email")
        .skip(skip)
        .limit(limit);
      const total = await taskModel.countDocuments({ assignedTo: userId });
      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch tasks");
    }
  }
  static async getAllTasks() {
    try {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const tasks = await taskModel
        .find()
        .populate("assignedTo", "username email")
        .skip(skip)
        .limit(limit);
      const total = await taskModel.countDocuments();
      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch tasks");
    }
  }

  static async updateTaskStatus({
    _id: taskId,
    status,
  }: Pick<ITask, "status" | "_id">) {
    if (!taskId || !status) {
      throw new Error("Task ID and status are required");
    }
    try {
      const task = await taskModel.findById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      task.status = status;
      await complainModel.updateMany(
        { taskId: taskId },
        { status: status === TASK_STATUS.COMPLETED ? COMPLAIN_STATUS.RESOLVED : status === TASK_STATUS.IN_PROGRESS ? COMPLAIN_STATUS.IN_PROGRESS  : COMPLAIN_STATUS.PENDING },
      );
      await task.save();
      return task;
    } catch (error) {
      throw new Error("Failed to update task status");
    }
  }

  static async deleteTask(taskId: string) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    try {
      const task = await taskModel.findByIdAndDelete(taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      return task;
    } catch (error) {
      throw new Error("Failed to delete task");
    }
  }

  static async assignTaskToDriver({
    _id: taskId,
    assignedTo,
  }: Pick<ITask, "_id" | "assignedTo">) {
    if (!taskId || !assignedTo) {
      throw new Error("Task ID and assigned user ID are required");
    }
    try {
      const task = await taskModel.findById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      task.assignedTo = assignedTo;
      await task.save();
      return task;
    } catch (error) {
      throw new Error("Failed to assign task to driver");
    }
  }

  static async getTaskById(taskId: string) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    try {
      const task = await taskModel
        .findById(taskId)
        .populate("assignedTo", "username email");
      if (!task) {
        throw new Error("Task not found");
      }
      return task;
    } catch (error) {
      throw new Error("Failed to fetch task");
    }
  }

  static async updateTask({
    _id: taskId,
    title,
    description,
    imageUrl,
    status,
    assignedTo,
    dueDate,
  }: Partial<ITask>) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    try {
      const task = await taskModel.findByIdAndUpdate(
        {
          _id: taskId,
        },
        {
          ...(title && { title }),
          ...(description && { description }),
          ...(imageUrl && { imageUrl }),
          ...(status && { status }),
          ...(assignedTo && { assignedTo }),
          ...(dueDate && { dueDate }),
        },
        { new: true },
      );
      if (!task) {
        throw new Error("Task not found");
      }
      return task;
    } catch (error) {
      throw new Error("Failed to update task");
    }
  }
            
}

export default TaskService;
