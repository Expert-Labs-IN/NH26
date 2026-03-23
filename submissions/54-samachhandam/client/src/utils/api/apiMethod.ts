/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "@/config/config";
import API from "./api";

export const get = async (
  endPoint: string,
  filter?: object,
  token?: string
): Promise<any> => {
  try {
    const queryString = new URLSearchParams(filter as any).toString();
    if (!token) {
      const response = await API.get<any>(`${endPoint}?${queryString}`);
      return response.data;
    } else {
      const response = await API.get<any>(`${endPoint}?${queryString}`, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
      return response.data;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};

export const post = async (
  endPoint: string,
  payload: object,
  token?: string,
  customHeaders?: object
): Promise<any> => {
  try {
    const requestHeaders = {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    };

    if (!token && !customHeaders) {
      const response = await API.post<any>(endPoint, payload);
      return response.data;
    } else {
      const response = await API.post<any>(endPoint, payload, {
        headers: requestHeaders,
      });
      return response.data;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};

export const put = async (
  endPoint: string,
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      const response = await API.put<any>(endPoint, payload);
      return response.data;
    } else {
      const response = await API.put<any>(endPoint, payload, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
      return response.data;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};

export const patch = async (
  endPoint: string,
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      const response = await API.patch<any>(endPoint, payload);
      return response.data;
    } else {
      const response = await API.patch<any>(endPoint, payload, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
      return response.data;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};

export const deleteRequest = async (
  endPoint: string,
  token?: string,
  data?: object
): Promise<any> => {
  try {
    if (!token) {
      const response = await API.delete<any>(endPoint, { data });
      return response.data;
    } else {
      const response = await API.delete<any>(endPoint, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
        data,
      });
      return response.data;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};
