import "express";
import { IUserToken } from "./types/interface/userToken.interface";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUserToken;
    file?: Multer.File;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserToken;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    user?: any;
  }
}