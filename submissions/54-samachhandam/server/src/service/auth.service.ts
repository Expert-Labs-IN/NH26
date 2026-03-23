import { ROLE } from "@/constants/role.constant";
import locationModel from "@/models/locations/locations.model";
import occupationModel from "@/models/occupation/occupation.model";
import preferedLocationModel from "@/models/preferedWorklocation/preferedLocation.model";
import userModel from "@/models/user/user.model";
import workerModel from "@/models/worker/worker.model";
import workingDaysModel from "@/models/workingDays/workingDays.model";
import IUser from "@/types/interface/user.interface";
import ArgonCrypt from "@/utils/argonCrypt";
import TokenService from "./token.service";

class AuthService {
  static async login({ mobile, password }: Pick<IUser, "mobile" | "password">) {
    if (!mobile || !password) {
      throw new Error("Mobile and password are required");
    }
    try {
      const user = await userModel.findOne({ mobile });
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid = await ArgonCrypt.verifyPassword(
        user.password,
        password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
      const accessToken = TokenService.accessToken({
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
      const userData = user.toObject();
      delete userData.password;
      return {
        user: userData,
        auth: {
          accessToken,
        },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  static async register(data: any) {
    const { name, email, mobile, password, role } = data;

    if (!name || !mobile) {
      throw new Error("Username and mobile are required");
    }

    try {
      const existingUser = await userModel.findOne({ mobile });
      if (existingUser) {
        throw new Error("User with this mobile already exists");
      }
      if (role === ROLE.ADMIN) {
        throw new Error("Cannot register as admin");
      }

      const hashedPassword = await ArgonCrypt.hashPassword(password);
      const newUser = new userModel({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: role || ROLE.USER,
      });
      await newUser.save();

      const accessToken = TokenService.accessToken({
        userId: newUser._id,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
      });

      const user = newUser.toObject();
      delete user.password;
      return {
        user,
        auth: {
          accessToken,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  }

  static logout() {}
}

export default AuthService;
