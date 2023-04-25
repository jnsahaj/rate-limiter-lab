import redis from "./redis.js";

function rateLimiter(req, res, next) {
    const maxRequests = 3; // Change this value as per your requirement
    const windowMs = 60 * 1000; // Change this value as per your requirement
    const userId = req.ip; // Change this value as per your requirement
    const timestamp = Date.now();
    const key = `${userId}:${Math.floor(timestamp / windowMs)}`;

    redis
        .multi()
        .set(key, 0, "NX", "EX", windowMs / 1000) // set initial value to 0 if key does not exist
        .incr(key)
        .expire(key, windowMs / 1000)
        .exec((err, results) => {
            if (err) {
                return next(err);
            }

            const currentRequests = results[1][1]; // get value of incremented key

            if (currentRequests > maxRequests) {
                return res.status(429).json({
                    message: `Too many requests, please try again in ${Math.ceil(
                        results[2] - timestamp / 1000
                    )} seconds`,
                });
            }

            next();
        });
}

export default rateLimiter;
