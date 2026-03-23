import { model } from "mongoose"
import driverSchema from "./worker.schema"

const workerModel = model("Worker", driverSchema)
export default workerModel