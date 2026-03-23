export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ErrorResponse {
  error: string;
}

/* Request Payload Types */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  role?: string;
}

