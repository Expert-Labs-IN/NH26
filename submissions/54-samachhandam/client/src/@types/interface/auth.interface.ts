export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  accessToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    auth: AuthData;
  };
}

export interface RegisterResponse extends LoginResponse { }

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export interface MeResponse extends UserProfile { }

/* Request Payload Types */
export interface LoginPayload {
  mobile: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobile: string;
  role?: 'admin' | 'user' | 'worker';
  location?:[number, number];
  locationStatus?: 'home' | 'work';
  occupations?: string[];
  workingDays?: string[];
  workingHours?: string;
}

export interface WorkerRegisterPayload extends RegisterPayload {
  occupations: string[];
  workingDays: string[];
  start_time: string;
  end_time: string;
}

