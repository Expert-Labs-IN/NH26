import { Types } from "mongoose";

export interface IWorkingDays {
    _id?: string;
    user_object_id: Types.ObjectId;
    working_days: {
        day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
        start_time: string; // Format: "HH:mm"
        end_time: string;   // Format: "HH:mm"
        is_in_leave?: boolean;
    }[];
}
