export const RateLimiter = class {
    constructor({ redisClient }) {
        this.redisClient = redisClient;
    }

    async slidingWindow({
        key,
        windowSizeInMs = 60 * 1000,
        maxRequestsPerWindow = 10,
    }) {
        const now = Date.now();
        const score = now;

        // Add a timestamped score to the sorted set for this key
        await this.redisClient.zadd(key, score, score);

        // Remove any entries from the set that are older than the sliding window
        const oldestAllowedScore = now - windowSizeInMs;

        await this.redisClient.zremrangebyscore(key, 0, oldestAllowedScore);

        // Count the number of remaining entries in the set
        const count = await this.redisClient.zcard(key);

        // Return true if the number of entries is less than the maximum allowed
        return count <= maxRequestsPerWindow;
    }
};
