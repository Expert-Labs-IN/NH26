import { Router } from "express";
import { getAllDrivers, getAllUsers } from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/drivers", getAllDrivers);
userRouter.get("/", getAllUsers);

export default userRouter;
