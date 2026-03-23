import { Request, Response, Router } from "express";
import WorkerService from "@/service/worker.service";

export const getComplains = async (req: Request, res: Response) => {
  try {
    const workerId = req.user?.userId as string;
    const result = await WorkerService.getComplainByUserId(workerId);
    res.status(200).json({
      success: true,
      message: "Complains retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrieve complains",
    });
  }
};
export const updateComplainStatus = async (req: Request, res: Response) => {
  try {
    const workerId = req.user?.userId as string;
    const complainId = Array.isArray(req.params.complainId)
      ? req.params.complainId[0]
      : req.params.complainId;
    const { status } = req.body;
    const result = await WorkerService.changeComplainState(complainId, status);
    res.status(200).json({
      success: true,
      message: "Complain status updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update complain status",
    });
  }
};
