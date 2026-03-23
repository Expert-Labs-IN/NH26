import UserService from "@/service/user.service";
import { ioInstance } from "./socket";

class Notification {
  static async sendToUser({ to, data }: { event: string, to: string; data: any }) {
    try {
      const sockets = await UserService.getUserSockets(to);
      sockets.forEach((socketId) => {
        ioInstance.to(socketId).emit("notification", { data });
      });
    } catch (error) {
      throw error;
    }
  }
  static async send({
    to,
    title,
    message,
    data,
  }: {
    to: string;
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      const sockets = await UserService.getUserSockets(to);
      sockets.forEach((socketId) => {
        ioInstance.to(socketId).emit("notification", { message, data, title });
      });
    } catch (error) {
      throw error;
    }
  }
}

export default Notification;
