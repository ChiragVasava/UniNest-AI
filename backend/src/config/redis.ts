import Redis from "ioredis";

/**
 * UniNest AI — Redis Infrastructure Module
 *
 * Singleton Redis client configured with exponential backoff reconnect strategy,
 * environment-driven parameters, and event logging for containerized execution.
 */

const REDIS_HOST = process.env.REDIS_HOST || "uninest-redis";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Global singleton declaration to prevent connection leaks during hot reloads in dev
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true, // Connect manually during app startup in server.ts
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times: number) {
      const delay = Math.min(times * 100, 3000);
      console.warn(`[Redis] Connection attempt #${times} failed. Reconnecting in ${delay}ms...`);
      return delay;
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ==============================================================================
// Redis Event Listeners
// ==============================================================================
redis.on("connect", () => {
  console.log(`[Redis] Establishing socket connection to ${REDIS_HOST}:${REDIS_PORT}...`);
});

redis.on("ready", () => {
  console.log(`[Redis] Server is ready to accept commands ✅ (${REDIS_HOST}:${REDIS_PORT})`);
});

redis.on("error", (err: Error) => {
  console.error(`[Redis] Connection Error: ${err.message}`);
});

redis.on("reconnecting", () => {
  console.log("[Redis] Reconnecting to Redis server...");
});

redis.on("end", () => {
  console.log("[Redis] Connection closed.");
});

// ==============================================================================
// Connection Lifecycle Management Functions
// ==============================================================================

/**
 * Initializes and verifies the Redis connection during backend startup.
 */
export const initRedis = async (): Promise<void> => {
  try {
    if (redis.status === "wait" || redis.status === "close") {
      await redis.connect();
      // Verify ping response
      const pong = await redis.ping();
      console.log(`[Redis] Health Check PING -> ${pong} ✅`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Redis] Initialization Failed: ${message}`);
  }
};

/**
 * Gracefully disconnects the Redis client during application shutdown.
 */
export const closeRedis = async (): Promise<void> => {
  try {
    if (redis.status !== "end") {
      await redis.quit();
      console.log("[Redis] Disconnected gracefully.");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Redis] Disconnect Error: ${message}`);
  }
};

export default redis;
