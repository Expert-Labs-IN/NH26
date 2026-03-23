import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import { Types } from "mongoose";
import { IOcupation } from "./occupation.interface";

export default interface IComplain {
  _id?: Types.ObjectId;
  complained_by: Types.ObjectId;
  description: string;
  status?: (typeof COMPLAIN_STATUS)[keyof typeof COMPLAIN_STATUS];
  category: Types.ObjectId;
  priority: string;
  createdAt?: Date;
  updatedAt?: Date;
  assigned_to?: Types.ObjectId;
  sheduled_time?: Date;
  title?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}
