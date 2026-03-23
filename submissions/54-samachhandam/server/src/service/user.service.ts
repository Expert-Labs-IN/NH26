import { redisClient } from "@/config/redis";
import { ROLE } from "@/constants/role.constant";
import userModel from "@/models/user/user.model";
import { Request, Response } from "express"; // Assuming Request and Response types are needed for the new function

class UserService {
  static async connectUser(userId: string, socketId: string) {
    try {
      await redisClient.sAdd(`user:${userId}:sockets`, socketId);
    } catch (error) {
      throw error;
    }
  }
  static async disconnectUser(userId: string, socketId: string) {
    try {
      await redisClient.sRem(`user:${userId}:sockets`, socketId);
    } catch (error) {
      throw error;
    }
  }
  static async getUserSockets(userId: string) {
    try {
      const sockets = await redisClient.sMembers(`user:${userId}:sockets`);
      return sockets;
    } catch (error) {
      throw error;
    }
  }

  static async getAllDrivers() {
    try {
      return await userModel.find({ role: ROLE.WORKER }).select("-password");
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      return await userModel.find({ role: ROLE.USER }).select("-password");
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
