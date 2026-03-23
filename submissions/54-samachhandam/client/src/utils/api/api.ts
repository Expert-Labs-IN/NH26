import type { ApiErrorResponse } from "@/@types/interface/apiErrorResponse.interface";
import { BACKEND_END_POINT, headers } from "@/config/config";
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";

const API: AxiosInstance = axios.create({
  baseURL: BACKEND_END_POINT,
  headers: {
    ...headers,
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  },
  withCredentials: true, // Enables cookies
});

// 🔹 Request interceptor (Add headers like Authorization if needed)
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the request data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response interceptor (Handles global API errors)
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message || "Something went wrong!";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default API;
