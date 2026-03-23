export default interface IComplain {
    _id?: string;
    complained_by: string;
    description: string;
    title?: string;
    category: any; // Can be string ID or populated object
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    coordinates?: {
        type?: "Point";
        coordinates?: [number, number];
        latitude?: number;
        longitude?: number;
    };
    city?: string;
    address?: string;
    imageUrl?: string;
    assigned_to?: any;
    sheduled_time?: string;
}
