import express from "express";
import authRouter from "./api/router/auth.route";
import taskRouter from "./api/router/task.route";
import complainRouter from "./api/router/complain.route";
import userRouter from "./api/router/user.route";
import cors from "cors";
import helmet from "helmet";
import chatRouter from "./api/router/chat.route";
import occupationRouter from "./api/router/occupation.route";
import workerRouter from "./api/router/worker.route";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'))

const allowedOrigins = ["http://localhost:5174", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(helmet()); // Add security headers

app.use("/api/auth", authRouter);
app.use("/api/task", taskRouter);
app.use("/api/complain", complainRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/occupation", occupationRouter);
app.use("/api/worker", workerRouter);
export default app;
