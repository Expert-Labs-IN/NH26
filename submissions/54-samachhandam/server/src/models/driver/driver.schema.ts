import { ROLE } from "@/constants/role.constant";
import IDriver from "@/types/interface/driver.interface";
import { Schema, Types } from "mongoose";

const driverSchema = new Schema<IDriver>(
  {
    user_object_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    license_number: { type: String, required: true },
    vehicle_type: { type: String, required: true },
  },
  { timestamps: true }
);
export default driverSchema;