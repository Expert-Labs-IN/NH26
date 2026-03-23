import { model } from "mongoose"
import locationSchema from "./locations.schema"

const locationModel = model("Locations", locationSchema)
export default locationModel
