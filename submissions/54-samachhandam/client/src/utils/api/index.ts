import { login, register, registerWorker } from "./auth/auth.api";
import * as task from "./task/task.api";
import * as userApi from "./worker/worker.api";
import * as occupation from "./occupation/occupation.api";
import { chatAPI as chat } from "./chat/chat.api";
import * as complain from "./complain/complain.api";

export const api = {
  auth: {
    login,
    register,
    registerWorker,
  },
  task,
  user: userApi,
  occupation,
  chat:{
    createSession: chat.createSession,
    sendMessage: chat.sendMessage,
  },
  complain,
};
