import { model } from "mongoose"
import workingDaysShema from "./workingDays.schema"

const workingDaysModel = model("Workingdays", workingDaysShema)
export default workingDaysModel
