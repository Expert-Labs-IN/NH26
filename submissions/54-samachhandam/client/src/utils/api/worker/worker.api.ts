import { get } from "@/utils/api/apiMethod";

export const getAllDrivers = async (): Promise<any> => {
  return await get("user/drivers");
};

export const getAllUsers = async (): Promise<any> => {
    return await get("user");
};
