import { model } from "mongoose"
import driverSchema from "./driver.schema"

const driverModel = model("Driver", driverSchema)
export default driverModel