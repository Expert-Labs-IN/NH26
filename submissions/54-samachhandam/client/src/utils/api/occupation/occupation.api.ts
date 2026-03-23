import API from "../api";
import type { IOcupation } from "@/@types/interface/occupation.interface";

export const getAllOccupations = async () => {
  const response = await API.get("/occupation");
  return response.data;
};

export const createOccupation = async (data: IOcupation) => {
  const response = await API.post("/occupation", data);
  return response.data;
};

export const updateOccupation = async (occupationId: string, data: Partial<IOcupation>) => {
  const response = await API.put(`/occupation/${occupationId}`, data);
  return response.data;
};

export const deleteOccupation = async (occupationId: string) => {
  const response = await API.delete(`/occupation/${occupationId}`);
  return response.data;
};
