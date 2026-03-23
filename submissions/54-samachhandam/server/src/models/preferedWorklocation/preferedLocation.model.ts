import { model } from "mongoose"
import preferedLocationSchema from "./preferedLocation.schema"

const preferedLocationModel = model("Preferedlocation", preferedLocationSchema)
export default preferedLocationModel
