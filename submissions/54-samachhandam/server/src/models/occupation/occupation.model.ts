import { model } from "mongoose"
import occupationSchema from "./occupation.schema"

const occupationModel = model("Occupation", occupationSchema)
export default occupationModel
