import dotenv from "dotenv";

dotenv.config();
export const config = {
    PORT: process.env.PORT || 8080,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_AGE: '7d',
    EVIRONMENT: process.env.ENV
}

export default config;