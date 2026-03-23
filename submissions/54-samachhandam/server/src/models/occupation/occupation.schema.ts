import { IOcupation } from "@/types/interface/occupation.interface";
import { Schema } from "mongoose";

const occupationSchema = new Schema<IOcupation>(
  {
    description: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);
export default occupationSchema;
