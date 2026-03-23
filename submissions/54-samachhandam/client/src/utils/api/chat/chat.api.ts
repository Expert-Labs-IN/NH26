import API from "../api";

export const chatAPI = {
  createSession: async () => {
    const response = await API.post("/chat/");
    return response.data;
  },
  sendMessage: async (sessionId: string, message: string) => {
    const response = await API.post(`/chat/${sessionId}`, { message });
    return response.data;
  },
};

