import { Router } from "express";
import { getComplains, updateComplainStatus } from "../controller/worker.controller";
import authCheck from "../middleware/authCheck";

const workerRouter = Router();

workerRouter.get("/complains", authCheck, getComplains);
workerRouter.patch("/complains/:complainId/status", authCheck, updateComplainStatus);

export default workerRouter;