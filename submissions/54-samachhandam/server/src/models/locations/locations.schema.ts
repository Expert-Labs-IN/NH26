import { ILocation } from "@/types/interface/locations.interface";
import { Schema } from "mongoose";

const locationSchema = new Schema<ILocation>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    country: { type: String, required: true },
    postal_code: { type: String, required: true },
    user_object_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default locationSchema;
