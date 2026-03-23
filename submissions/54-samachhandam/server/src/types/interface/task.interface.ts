import { TASK_STATUS } from "@/constants/taskStatus.constant";
import { Types } from "mongoose";

export default interface ITask {
    _id?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
    assignedTo?: Types.ObjectId; // userId of the assigned user
    dueDate?: Date;
}