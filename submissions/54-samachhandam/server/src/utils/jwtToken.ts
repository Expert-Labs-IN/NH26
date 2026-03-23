import config from "@/config/config"
import { IUserToken } from "@/types/interface/userToken.interface"
import jwt from "jsonwebtoken"

class JwtToken {
    private static secretKey = config.JWT_SECRET || 'no_secret_key_provided'
    private static expiresIn = config.ACCESS_TOKEN_AGE || '7d'
    static verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, this.secretKey)
            return decoded as IUserToken
        } catch (error) {
            throw new Error("Invalid token")
        }
    }

    static generateToken(payload: any) {
        return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn })
    }

}

export default JwtToken