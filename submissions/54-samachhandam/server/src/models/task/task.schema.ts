import { TASK_STATUS } from "@/constants/taskStatus.constant";
import ITask from "@/types/interface/task.interface";
import { Schema } from "mongoose";

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: false },
    dueDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export default taskSchema;
