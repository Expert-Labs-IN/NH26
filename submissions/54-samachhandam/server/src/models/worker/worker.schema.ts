import { IWorker } from "@/types/interface/worker.interface";
import { Schema } from "mongoose";

const workerSchema = new Schema<IWorker>(
  {
    user_object_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    occupation_object_id: {
      type: Schema.Types.ObjectId,
      ref: "Occupation",
      required: true,
    },
   location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
    working_days: { type: [String], required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
  },
  { timestamps: true },
);

workerSchema.index({ location: "2dsphere" });

export default workerSchema;
