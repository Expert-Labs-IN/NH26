import { model } from "mongoose"
import complainSchema from "./complain.schema"

const complainModel = model("Complain", complainSchema)
export default complainModel
