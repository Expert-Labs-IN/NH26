import Notification from "@/config/notification";
import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import complainModel from "@/models/complain/complain.model";
import IComplain from "@/types/interface/complain.interface";
import TaskRankingService from "./ranking.service";

class ComplainService {
  static async createComplain({
    complained_by,
    description,
    coordinates,
    status,
    category,
    priority,
    title
  }: IComplain) {
    if (!complained_by || !description || !coordinates) {
      throw new Error("Missing required fields");
    }
    try {
      const complain = await complainModel.create({
        complained_by,
        description,
        coordinates: {
          type: "Point",
          coordinates: [(coordinates as unknown as any).longitude, (coordinates as unknown as any).latitude],
        },
        status: "pending",
        category,
        priority,
        title
      });
      const complainData = await TaskRankingService.rankMembersAndNotify(complain);

      return complainData;
    } catch (error) {
      console.error("Error in createComplain:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create complain");
    }
  }

  static async getComplainsByUser(userId: string) {
    try {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const complains = await complainModel
        .find({ complained_by: userId })
        .populate("complained_by", "username email")
        .skip(skip)
        .limit(limit);

      const total = await complainModel.countDocuments({
        complained_by: userId,
      });

      return {
        complains,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch complains");
    }
  }

  static async getAllComplains() {
    try {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const complains = await complainModel
        .find()
        .populate("complained_by", "username email")
        .skip(skip)
        .limit(limit);

      const total = await complainModel.countDocuments();

      return {
        complains,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch complains");
    }
  }

  static async updateComplainStatus({
    _id: complainId,
    status,
  }: Pick<IComplain, "_id" | "status">) {
    try {
      const complain = await complainModel.findByIdAndUpdate(
        {
          _id: complainId,
        },
        {
          status,
        },
        { new: true },
      );
      if (!complain) {
        throw new Error("Complain not found");
      }
      return complain;
    } catch (error) {
      throw new Error("Failed to update complain status");
    }
  }

  static async deleteComplain(complainId: string) {
    try {
      const complain = await complainModel.findByIdAndDelete(complainId);
      if (!complain) {
        throw new Error("Complain not found");
      }
      return complain;
    } catch (error) {
      throw new Error("Failed to delete complain");
    }
  }

  static async getComplainById(complainId: string) {
    try {
      const complain = await complainModel
        .findById(complainId)
        .populate("complained_by", "username email");
      if (!complain) {
        throw new Error("Complain not found");
      }
      return complain;
    } catch (error) {
      throw new Error("Failed to fetch complain");
    }
  }

  static async getComplainsByFilter(
    filter: Partial<IComplain>,
    dateRange?: { start: Date; end: Date },
  ) {
    try {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const filters: any = {};
      if (filter.status) {
        filters.status = filter.status;
      }
      if (filter.complained_by) {
        filters.complained_by = filter.complained_by;
      }
      if (dateRange) {
        filters.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
      }
      const complains = await complainModel
        .find(filters)
        .populate("complained_by", "username email")
        .skip(skip)
        .limit(limit);
      const total = await complainModel.countDocuments(filters);
      return {
        complains,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch complains");
    }
  }

  static async acceptComplain({
    complainId,
    workerId,
    time,
  } : {
    complainId: string;
    workerId: string;
    time: Date;
  }) {
    try {
      const complain = await complainModel.findByIdAndUpdate(
        {
          _id: complainId,
        },
        {
          status: COMPLAIN_STATUS.ASSIGNED,
          assigned_to: workerId,
          sheduled_time: time,
        },
        { new: true },
      );
      if (!complain) {
        throw new Error("Complain not found");
      }
      Notification.send({
        to: complain.complained_by.toString(),
        title: "Complain Accepted",
        message: `Your complain has been accepted and assigned to a worker. Scheduled time: ${time.toLocaleString()}`,
      })
      Notification.sendToUser({
        event: "complain_expired",
        to: workerId,
        data: {
          type: "complain_assigned",
          complainId: complain._id.toString(),
          message: `You have been assigned a new complain. Scheduled time: ${time.toLocaleString()}`,
        }
      })
      return complain;
    } catch (error) {
      throw new Error("Failed to accept complain");
    }
  }
}

export default ComplainService;
