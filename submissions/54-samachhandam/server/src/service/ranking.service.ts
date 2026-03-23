import { COMPLAIN_STATUS } from "@/constants/complainStatus.contsant";
import WorkerService from "./worker.service";
import Notification from "@/config/notification";
import IComplain from "@/types/interface/complain.interface";
import complainModel from "@/models/complain/complain.model";

class TaskRankingService {
  static async rankMembersAndNotify(complain: IComplain) {
    try {
      console.log(complain)
      const [ longitude, latitude ] = complain.coordinates.coordinates;
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
          console.warn("Missing or invalid coordinates for ranking, skipping worker assignment.");
          return complain;
      }

      const worker = await WorkerService.findNearestWorker(
        longitude,
        latitude,
        complain.category,
        5000,
      );
      console.log(worker)
      if (worker) {
        const comp = await complainModel.findById(complain._id);
        comp.assigned_to = worker.user_object_id;
        comp.status = COMPLAIN_STATUS.ASSIGNED;
        await comp.save();
        Notification.sendToUser({
          event: "new_complain",
          data: complain,
          to: worker.user_object_id.toString(),
        });
      }

      return complain;
    } catch (error) {
      console.log("Error in rankMembers:", error);
      throw new Error(error.message || "Error ranking members");
    }
  }
}

export default TaskRankingService;
