import { ComplainStatus } from "@/constants/complainStatus.contsant";
import { TaskStatus } from "@/constants/taskStatus.constant";
import complainModel from "@/models/complain/complain.model";
import workerModel from "@/models/worker/worker.model";
import { IOcupation } from "@/types/interface/occupation.interface";
import { IWorker } from "@/types/interface/worker.interface";

class WorkerService {
  static async createWorker({
    user_object_id,
    occupation_object_id,
    working_days,
    start_time,
    end_time,
    location
  }: Partial<IWorker>) {
    // Robust validation for required fields
    if (
      !occupation_object_id ||
      !user_object_id ||
      !working_days ||
      !start_time ||
      !end_time
    ) {
      throw new Error("All worker profile fields are required (occupation, working days, shifts)");
    }

    try {
      const worker = new workerModel({
        occupation_object_id,
        user_object_id,
        working_days,
        start_time,
        end_time,
        location: {
          type: "Point",
          coordinates: location && Array.isArray(location) ? [location[0], location[1]] : [0, 0],
        },
      });
      await worker.save();
      return worker as IWorker;
    } catch (error) {
      throw new Error("Failed to create worker: " + (error instanceof Error ? error.message : "Internal Database Error"));
    }
  }

  static async findNearestWorker(
    lng: number,
    lat: number,
    occupation: string,
    distanceInMeters: number = 5000,
  ) {
    const workers = await workerModel
      .find({
      occupation_object_id: occupation,
      location: {
        $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: distanceInMeters,
        },
      },
      })
      .limit(1);

    return workers[0] || null;
  }

  static async getComplainByUserId(userId: string) {
    try {
      const worker = await workerModel.findOne({ user_object_id: userId });
      if (!worker) {
        throw new Error("Worker not found");
      }
      const complains = await complainModel.find({
        assigned_to: worker.user_object_id,
      });
      return complains;
    } catch (error) {
      throw error;
    }
  }

  static async changeComplainState(complainId: string, newState: ComplainStatus) {
    try {
      const complain = await complainModel.findById(complainId);
      if (!complain) {
        throw new Error("Complain not found");
      }
      complain.status = newState;
      await complain.save();
      return complain;
    } catch (error) {
      throw error;
    }
  }
}

export default WorkerService;
