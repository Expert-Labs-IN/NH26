import { Types } from "mongoose";

export interface IWorker {
    _id?: string;
    user_object_id: Types.ObjectId;
    occupation_object_id: Types.ObjectId;
    location_object_id: Types.ObjectId;
    working_days_object_id: Types.ObjectId;
    prefered_location_object_id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
