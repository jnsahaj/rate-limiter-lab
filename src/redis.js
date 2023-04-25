import Redis from "ioredis";
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.log(`Err connecting to Redis: ${err}`);
});

export default redis;
