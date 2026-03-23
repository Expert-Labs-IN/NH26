import { Types } from "mongoose";

export interface ILocation {
    _id?: string;
    user_object_id: Types.ObjectId;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}
