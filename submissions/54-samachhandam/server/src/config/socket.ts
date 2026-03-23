import { ROLE } from "@/constants/role.constant";
import { IUserToken } from "@/types/interface/userToken.interface";
import JwtToken from "@/utils/jwtToken";
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export let ioInstance: Server | null = null;

const getBearerToken = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken;
  }

  const authHeader = socket.handshake.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const initializeSocket = (server: HttpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const token = getBearerToken(socket);
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const user = JwtToken.verifyToken(token);
      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  ioInstance.on("connection", async (socket) => {
    const user = socket.user as IUserToken | undefined;
    if (!user) {
      return;
    }

    socket.join(`user:${user.userId}`);
    if (user.role === ROLE.ADMIN) {
      socket.join("admin");
    }

    socket.on("disconnect", async () => {

    });
  });

  return ioInstance;
};

export const getSocketIO = () => ioInstance;