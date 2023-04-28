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

    async tokenBucket({ key, bucketSize = 5, refillRateInMs = 1000 }) {
        const now = Date.now();
        const timestampKey = `${key}:lastRefillTimestamp`;
        const bucketKey = `${key}:bucket`;

        // Get the timestamp of the last refill
        const lastRefillTimestamp = await this.redisClient.get(timestampKey);

        // Calculate the amount of tokens to add to the bucket
        let tokensToAdd = 0;
        if (lastRefillTimestamp) {
            const elapsedTime = now - parseInt(lastRefillTimestamp);
            tokensToAdd = Math.floor(elapsedTime / refillRateInMs);
        } else {
            tokensToAdd = bucketSize;
        }

        // Refill the bucket with new tokens
        const currentTokens = parseInt(
            (await this.redisClient.get(bucketKey)) || 0
        );
        const newTokens = Math.min(currentTokens + tokensToAdd, bucketSize);
        await this.redisClient.set(bucketKey, newTokens);

        // Check if there are enough tokens in the bucket
        if (newTokens >= 1) {
            // Set the timestamp of the last refill
            await this.redisClient.set(timestampKey, now.toString());
            // Take away one token from the bucket
            await this.redisClient.decr(bucketKey);
            return true;
        } else {
            return false;
        }
    }
};
