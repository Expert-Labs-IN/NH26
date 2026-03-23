import { Types } from "mongoose";

export interface IHousehold {
  _id?: string;
  user_object_id: Types.ObjectId;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  landmark: string;
}
