import { IWorkingDays } from "@/types/interface/workingdays.interface";
import { Schema } from "mongoose";

const workingDaysShema = new Schema<IWorkingDays>(
  {
    user_object_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    working_days: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        start_time: { type: String, required: true },
        end_time: { type: String, required: true },
        is_in_leave: { type: Boolean, default: false },
      },
    ],
    
  },
  { timestamps: true }
);

export default workingDaysShema;
