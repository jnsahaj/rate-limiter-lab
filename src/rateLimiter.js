import {
    FIXED_WINDOW,
    FIXED_WINDOW_DEFAULTS,
    SLIDING_WINDOW,
    SLIDING_WINDOW_DEFAULTS,
    TOKEN_BUCKET,
    TOKEN_BUCKET_DEFAULTS,
} from "./constants.js";

import applyDefaults from "./utils/applyDefaults.js";

export const RateLimiter = class {
    static initialize({ redisClient }) {
        RateLimiter.redisClient = redisClient;
    }

    static async isAllowed({ key, scheme, ...options }) {
        const limiter = RateLimiter._getLimiter(scheme, options);
        RateLimiter.limiter = limiter;
        return limiter.isAllowed(key);
    }

    static async removeKey(key) {
        await RateLimiter.limiter.removeKey(key);
    }

    static _getLimiter(scheme = SLIDING_WINDOW, options) {
        switch (scheme) {
            case FIXED_WINDOW:
                const fixedWindowOptions = applyDefaults(
                    options,
                    FIXED_WINDOW_DEFAULTS
                );
                return new FixedWindowLimiter({
                    redisClient: RateLimiter.redisClient,
                    ...fixedWindowOptions,
                });
            case SLIDING_WINDOW:
                const slidingWindowOptions = applyDefaults(
                    options,
                    SLIDING_WINDOW_DEFAULTS
                );
                return new SlidingWindowLimiter({
                    redisClient: RateLimiter.redisClient,
                    ...slidingWindowOptions,
                });
            case TOKEN_BUCKET:
                const tokenBucketOptions = applyDefaults(
                    options,
                    TOKEN_BUCKET_DEFAULTS
                );
                return new TokenBucketLimiter({
                    redisClient: RateLimiter.redisClient,
                    ...tokenBucketOptions,
                });
            default:
                throw new Error(`Invalid algorithm: ${this.algorithm}`);
        }
    }
};

class FixedWindowLimiter {
    constructor({ redisClient, windowSizeInMs, maxRequestsPerWindow }) {
        this.redisClient = redisClient;
        this.windowSizeInMs = windowSizeInMs;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
    }

    async isAllowed(key) {
        const now = Date.now();
        const windowStart =
            Math.floor(now / this.windowSizeInMs) * this.windowSizeInMs;
        const windowEnd = windowStart + this.windowSizeInMs;
        const count = await this.redisClient.zcount(
            key,
            windowStart,
            windowEnd - 1
        );
        const isAllowed = count < this.maxRequestsPerWindow;
        if (isAllowed) {
            await this.redisClient.zadd(key, now, now);
        }
        return isAllowed;
    }

    async removeKey(key) {
        await this.redisClient.del(key);
    }
}

class SlidingWindowLimiter {
    constructor({ redisClient, windowSizeInMs, maxRequestsPerWindow }) {
        this.redisClient = redisClient;
        this.windowSizeInMs = windowSizeInMs;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
    }

    async isAllowed(key) {
        const now = Date.now();
        const score = now;

        // Add a timestamped score to the sorted set for this key
        await this.redisClient.zadd(key, score, score);

        // Remove any entries from the set that are older than the sliding window
        const oldestAllowedScore = now - this.windowSizeInMs;
        await this.redisClient.zremrangebyscore(key, 0, oldestAllowedScore);

        // Count the number of remaining entries in the set
        const count = await this.redisClient.zcard(key);

        // Return true if the number of entries is less than the maximum allowed
        return count <= this.maxRequestsPerWindow;
    }

    async removeKey(key) {
        await this.redisClient.del(key);
    }
}

const TokenBucketLimiter = class {
    constructor({ redisClient, bucketSize, refillRateInMs }) {
        this.redisClient = redisClient;
        this.bucketSize = bucketSize;
        this.refillRateInMs = refillRateInMs;
    }

    getKeyNames(key) {
        return {
            timestampKey: `${key}:lastRefillTimestamp`,
            bucketKey: `${key}:bucket`,
        };
    }

    async isAllowed(key) {
        const now = Date.now();
        const { timestampKey, bucketKey } = this.getKeyNames(key);

        // Get the timestamp of the last refill
        const lastRefillTimestamp = await this.redisClient.get(timestampKey);

        // Calculate the amount of tokens to add to the bucket
        let tokensToAdd = 0;
        if (lastRefillTimestamp) {
            const elapsedTime = now - parseInt(lastRefillTimestamp);
            tokensToAdd = Math.floor(elapsedTime / this.refillRateInMs);
        } else {
            tokensToAdd = this.bucketSize;
        }

        // Refill the bucket with new tokens
        const currentTokens = parseInt(
            (await this.redisClient.get(bucketKey)) || 0
        );
        const newTokens = Math.min(
            currentTokens + tokensToAdd,
            this.bucketSize
        );
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

    async removeKey(key) {
        const { timestampKey, bucketKey } = this.getKeyNames(key);

        await this.redisClient.del(timestampKey, bucketKey);
    }
};
