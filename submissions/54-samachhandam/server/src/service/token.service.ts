import { IUserToken } from "@/types/interface/userToken.interface";
import JwtToken from "@/utils/jwtToken";

class TokenService {

    static accessToken(payload: IUserToken) {
        try {
            return JwtToken.generateToken(payload)
        } catch (error) {
            throw new Error("Failed to generate access token")
        }
    }

    static verifyAccessToken(token: string) {
        try {
            return JwtToken.verifyToken(token)
        } catch (error) {
            throw new Error("Failed to verify access token")
        }
    }
}

export default TokenService