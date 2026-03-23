import { Types } from "mongoose";
import { IWorkingDays } from "./workingdays.interface";
import { IPreferedWorkLocation } from "./preferedWorkLocation.interface";
import { ILocation } from "./locations.interface";

export interface IWorker {
    _id?: string;
    user_object_id: Types.ObjectId;
    occupation_object_id: Types.ObjectId;
    location: ILocation;
    working_days: IWorkingDays[];
    // prefered_location: IPreferedWorkLocation;
    start_time: string;
    end_time: string;
    createdAt: Date;
    updatedAt: Date;
}