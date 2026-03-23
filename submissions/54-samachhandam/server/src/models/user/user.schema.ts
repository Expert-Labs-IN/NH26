import { ROLE } from "@/constants/role.constant";
import IUser from "@/types/interface/user.interface";
import { Schema } from "mongoose";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    mobile: { type: String, required: true },
    password: { type: String, required: false },
    role: { type: String, required: true, enum: Object.values(ROLE)},
  },
  { timestamps: true }
);
export default userSchema;