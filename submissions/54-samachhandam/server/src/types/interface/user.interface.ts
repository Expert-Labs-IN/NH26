import { ROLE } from "@/constants/role.constant";
export default interface IUser {
    _id?: string;
    name: string;
    email?: string;
    mobile: string;
    password?: string;
    role: typeof ROLE[keyof typeof ROLE];
    createdAt: Date;
    updatedAt: Date;
}