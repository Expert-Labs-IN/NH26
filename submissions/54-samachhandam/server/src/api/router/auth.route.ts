import { Router } from "express";
import { login, register, registerWorker } from "../controller/auth.controller";
const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/register-worker", registerWorker);

export default authRouter;