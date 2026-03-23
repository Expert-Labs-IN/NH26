import { ILocation } from "@/types/interface/locations.interface";
import { IPreferedWorkLocation } from "@/types/interface/preferedWorkLocation.interface";
import { Schema } from "mongoose";

const preferedLocationSchema = new Schema<IPreferedWorkLocation>(
  {
    locations: [
      {
        coordinates: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
        landmark: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default preferedLocationSchema;
