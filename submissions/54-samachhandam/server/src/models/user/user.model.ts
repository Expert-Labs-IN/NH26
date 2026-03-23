import { model } from "mongoose"
import userSchema from "./user.schema"

const userModel = model("User", userSchema)
export default userModel