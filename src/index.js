import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import rateLimiter from "./middlewares/rateLimiter.js";
import redis from "./redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "/../client/dist")));
app.use(express.json());
app.use(cors());

app.get("/", rateLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, "/../client/dist/index.html"));
});

app.get("/limit", rateLimiter, (req, res) => {
    res.json({
        result: 1,
    });
});

app.post("/limit", (req, res) => {
    const limiterParams = req.body;
    redis.flushdb();
    redis.hmset("limiterParams", limiterParams);
    res.status(200).json(limiterParams);
});

app.get("/limiters", (_, res) => {
    res.json([
        {
            title: "Sliding Window",
            scheme: "sliding_window",
            parameters: [
                {
                    title: "Max Requests Per Window",
                    id: "max_requests_per_window",
                    defaultValue: 10,
                },
                {
                    title: "Window Size",
                    unit: "ms",
                    id: "window_size_in_ms",
                    defaultValue: 60000,
                },
            ],
        },
        {
            title: "Token Bucket",
            scheme: "token_bucket",
            parameters: [
                {
                    title: "Bucket Size",
                    id: "bucket_size",
                    defaultValue: 5,
                },
                {
                    title: "Refill Rate",
                    unit: "ms",
                    id: "refill_rate_in_ms",
                    defaultValue: 1000,
                },
            ],
        },
    ]);
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
