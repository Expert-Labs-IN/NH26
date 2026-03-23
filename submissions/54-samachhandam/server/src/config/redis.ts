import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (error) => {
  console.error("[Redis] Client error:", error);
});

let connectPromise: Promise<void> | null = null;

export const connectRedis = async () => {
  if (redisClient.isOpen) {
    return;
  }

  if (!connectPromise) {
    connectPromise = redisClient
      .connect()
      .then(() => {
        console.log("[Redis] Connected successfully ✅");
      })
      .catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  await connectPromise;
};


export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

