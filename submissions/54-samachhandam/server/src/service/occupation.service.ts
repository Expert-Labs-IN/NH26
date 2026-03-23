import occupationModel from "@/models/occupation/occupation.model";
import { IOcupation } from "@/types/interface/occupation.interface";

class OccupationService {
  static async createOccupation({ description, name }: IOcupation) {
    try {
      const occupation = new occupationModel({
        description,
        name,
      });
      await occupation.save();
      return occupation;
    } catch (error) {
      throw error;
    }
  }
  static async getAllOccupations() {
    {
      try {
        const occupations = await occupationModel.find();
        return occupations;
      } catch (error) {
        throw error;
      }
    }
  }
  static async editOccupation(
    occupationId: string,
    updateData: Partial<IOcupation>,
  ) {
    try {
      const occupation = await occupationModel.findByIdAndUpdate(
        occupationId,
        updateData,
        { new: true },
      );
      if (!occupation) {
        throw new Error("Occupation not found");
      }
      return occupation;
    } catch (error) {
      throw error;
    }
  }
  static async deleteOccupation(occupationId: string) {
    try {
      const occupation = await occupationModel.findByIdAndDelete(occupationId);
      if (!occupation) {
        throw new Error("Occupation not found");
      }
      return occupation;
    } catch (error) {
      throw error;
    }
}
}

export default OccupationService;
