import { RateLimiter } from "../rateLimiter.js";
import redisClient from "../redis.js";

const DEFAULT_SCHEME = "sliding_window";

const rateLimiter = async (req, res, next) => {
    const rateLimiter = new RateLimiter({
        redisClient,
    });

    const limiterParams = await redisClient.hgetall("limiterParams");

    const scheme = limiterParams.scheme || DEFAULT_SCHEME;

    if (scheme === "sliding_window") {
        const { max_requests_per_window, window_size_in_ms } = limiterParams;
        const isAllowed = await rateLimiter.slidingWindow({
            key: req.ip,
            maxRequestsPerWindow:
                parseInt(max_requests_per_window) || undefined,
            windowSizeInMs: parseInt(window_size_in_ms) || undefined,
        });

        if (isAllowed) {
            return next();
        } else {
            return res.status(429).send("Too Many Requests");
        }
    }

    if (scheme === "token_bucket") {
        const { bucket_size, refill_rate_in_ms } = limiterParams;
        const isAllowed = await rateLimiter.tokenBucket({
            key: req.ip,
            bucketSize: parseInt(bucket_size) || undefined,
            refillRateInMs: parseInt(refill_rate_in_ms) || undefined,
        });

        if (isAllowed) {
            return next();
        } else {
            return res.status(429).send("Too Many Requests");
        }
    }
};

export default rateLimiter;
