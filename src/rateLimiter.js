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
    constructor({ redisClient }) {
        this.redisClient = redisClient;
    }

    async isAllowed({ key, scheme, ...options }) {
        const limiter = this._getLimiter(scheme, options);
        return limiter.isAllowed(key);
    }

    _getLimiter(scheme = SLIDING_WINDOW, options) {
        switch (scheme) {
            case FIXED_WINDOW:
                const fixedWindowOptions = applyDefaults(
                    options,
                    FIXED_WINDOW_DEFAULTS
                );
                return new FixedWindowLimiter({
                    redisClient: this.redisClient,
                    ...fixedWindowOptions,
                });
            case SLIDING_WINDOW:
                const slidingWindowOptions = applyDefaults(
                    options,
                    SLIDING_WINDOW_DEFAULTS
                );
                return new SlidingWindowLimiter({
                    redisClient: this.redisClient,
                    ...slidingWindowOptions,
                });
            case TOKEN_BUCKET:
                const tokenBucketOptions = applyDefaults(
                    options,
                    TOKEN_BUCKET_DEFAULTS
                );
                return new TokenBucketLimiter({
                    redisClient: this.redisClient,
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
}

const TokenBucketLimiter = class {
    constructor({ redisClient, bucketSize, refillRateInMs }) {
        this.redisClient = redisClient;
        this.bucketSize = bucketSize;
        this.refillRateInMs = refillRateInMs;
    }

    async isAllowed(key) {
        const now = Date.now();
        const timestampKey = `${key}:lastRefillTimestamp`;
        const bucketKey = `${key}:bucket`;

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
};
