import { model } from "mongoose"
import workingDaysShema from "./workingDays.schema"

const workingDays = model("Workingdays", workingDaysShema)
export default workingDays
