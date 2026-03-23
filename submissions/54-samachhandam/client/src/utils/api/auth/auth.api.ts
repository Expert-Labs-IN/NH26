import type { ErrorResponse, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "@/@types/interface/auth.interface";
import { post } from "@/utils/api/apiMethod";

const ROUTE = "auth";

export const login = async (payload: LoginPayload): Promise<LoginResponse | ErrorResponse> => {
  return await post(`${ROUTE}/login`, payload);
};

export const register = async (payload: RegisterPayload): Promise<RegisterResponse | ErrorResponse> => {
  return await post(`${ROUTE}/register`, payload);
};



export const registerWorker = async (payload: RegisterPayload): Promise<RegisterResponse | ErrorResponse> => {
  return await post(`${ROUTE}/register-worker`, payload);
};