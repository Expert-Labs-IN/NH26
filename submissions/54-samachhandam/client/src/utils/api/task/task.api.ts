import type ITask from "@/@types/interface/task.interface";
import { get, post, patch, deleteRequest } from "@/utils/api/apiMethod";

export const createTask = async (payload: Partial<ITask>): Promise<any> => {
  return await post("task", payload);
};

export const getAllTasks = async (): Promise<any> => {
  return await get("task");
};

export const getTaskById = async (id: string): Promise<any> => {
  return await get(`task/${id}`);
};

export const getTasksByWorkerId = async (userId: string): Promise<any> => {
  return await get(`task/worker/${userId}`);
};

export const updateTaskStatus = async (id: string, status: string): Promise<any> => {
  return await patch(`task/${id}/status`, { status });
};

export const assignTask = async (id: string, assignedTo: string): Promise<any> => {
  return await patch(`task/${id}/assign`, { assignedTo });
};

export const updateTask = async (id: string, data: Partial<ITask>): Promise<any> => {
  return await patch(`task/${id}`, data);
};

export const deleteTask = async (id: string): Promise<any> => {
  return await deleteRequest(`task/${id}`);
};
