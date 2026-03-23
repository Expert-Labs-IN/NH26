import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import IComplain from "@/types/interface/complain.interface";
import { IHousehold } from "@/types/interface/household.interface";
import { Schema } from "mongoose";

const houseHoldSchema = new Schema<IHousehold>(
  {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    user_object_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default houseHoldSchema;
