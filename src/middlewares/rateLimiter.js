import { RateLimiter } from "../rateLimiter.js";
import redisClient from "../redis.js";
import { DEFAULT_SCHEME, RATE_LIMITER_SCHEMES } from "../constants.js";

const rateLimiterMiddleware = async (req, res, next) => {
    try {
        const rateLimiter = new RateLimiter({ redisClient });
        const limiterParams = await redisClient.hgetall("limiterParams");

        let isAllowed = await rateLimiter.isAllowed({
            key: req.ip,
            ...limiterParams,
        });

        if (isAllowed) {
            return next();
        } else {
            return res.status(429).send("Too Many Requests");
        }
    } catch (error) {
        console.error(`Error in rate limiter middleware: ${error}`);
        return res.status(500).send("Internal Server Error");
    }
};

export default rateLimiterMiddleware;
