import argon2 from "argon2";

class ArgonCrypt {
    static async hashPassword(password: string): Promise<string> {
        const hash = await argon2.hash(password);
        return hash;
    }
    static async verifyPassword(hash: string, password: string): Promise<boolean> {
        return await argon2.verify(hash, password);
    }
}

export default ArgonCrypt