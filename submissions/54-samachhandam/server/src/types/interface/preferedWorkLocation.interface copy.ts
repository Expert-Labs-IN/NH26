export interface IPreferedWorkLocation {
    _id?: string;
    user_object_id: string;
    locations: [
        {
            coordinates: {
                longitude: number;
                latitude: number;
            },
            landmark: string;
        }
    ]
}