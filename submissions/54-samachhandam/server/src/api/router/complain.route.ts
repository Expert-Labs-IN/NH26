import { Router } from "express";
import {
    createComplain,
    getAllComplains,
    getComplainById,
    getComplainsByUser,
    getComplainsByFilter,
    updateComplainStatus,
    deleteComplain,
    acceptComplain
} from "../controller/complain.controller";
import authCheck from "../middleware/authCheck";

const complainRouter = Router();

complainRouter.post("/", authCheck, createComplain);
complainRouter.get("/", getAllComplains);
complainRouter.get("/filter", getComplainsByFilter);
complainRouter.get("/:complainId", getComplainById);
complainRouter.get("/user/:userId", getComplainsByUser);
complainRouter.patch("/:complainId/status", updateComplainStatus);
complainRouter.delete("/:complainId", deleteComplain);
complainRouter.post("/:complainId/accept", acceptComplain);

export default complainRouter;
