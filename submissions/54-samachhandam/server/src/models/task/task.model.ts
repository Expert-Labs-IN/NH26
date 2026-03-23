import { model } from "mongoose"
import taskSchema from "./task.schema"

const taskModel = model("Task", taskSchema)
export default taskModel
