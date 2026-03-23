import { get, post, patch, deleteRequest } from "@/utils/api/apiMethod";

export const createComplain = async (payload: any) => {
  return await post("complain", payload);
};

export const getAllComplains = async () => {
  return await get("complain");
};

export const getComplainById = async (id: string) => {
  return await get(`complain/${id}`);
};

export const getComplainsByUserId = async (userId: string) => {
  return await get(`complain/user/${userId}`);
};

export const getComplainsByFilter = async (params: any) => {
  const queryString = new URLSearchParams(params).toString();
  return await get(`complain/filter?${queryString}`);
};

export const updateComplainStatus = async (id: string, status: string) => {
  return await patch(`complain/${id}/status`, { status });
};

export const acceptComplain = async (id: string, time: Date) => {
  return await post(`complain/${id}/accept`, { time });
};

export const deleteComplain = async (id: string) => {
  return await deleteRequest(`complain/${id}`);
};
