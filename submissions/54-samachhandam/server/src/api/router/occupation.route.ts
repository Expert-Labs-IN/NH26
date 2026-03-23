import { ROLE } from "@/constants/role.constant";
import authCheck from "../middleware/authCheck";
import roleBasedAuth from "../middleware/rollbasedAuth";
import { Router } from "express";
import {
  createOccupation,
  deleteOccupation,
  getAllOccupations,
  updateOccupation,
} from "../controller/occupation.controller";

const occupationRouter = Router()

occupationRouter.post("/", createOccupation)
occupationRouter.get("/", getAllOccupations)
occupationRouter.put("/:occupationId", updateOccupation)
occupationRouter.delete("/:occupationId", deleteOccupation)

export default occupationRouter