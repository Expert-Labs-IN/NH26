import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import IComplain from "@/types/interface/complain.interface";
import { Schema } from "mongoose";

const complainSchema = new Schema<IComplain>(
  {
    complained_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigned_to: { type: Schema.Types.ObjectId, ref: "Worker", required: false },
    description: { type: String, required: true },
    title: { type: String, required: false },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    category: { type: Schema.Types.ObjectId, ref: "Occupation", required: true },
    priority: { type: String, required: true },
    sheduled_time: { type: Date, required: false },
    status: {
      type: String,
      required: true,
      enum: Object.values(COMPLAIN_STATUS),
      default: COMPLAIN_STATUS.PENDING,
    }
  },
  { timestamps: true }
);

export default complainSchema;
