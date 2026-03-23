import { model } from "mongoose"
import houseHoldSchema from "./household.schema"

const householdModel = model("Household", houseHoldSchema)
export default householdModel