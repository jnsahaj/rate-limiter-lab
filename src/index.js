import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import rateLimiter from "./middlewares/rateLimiter.js";
import redis from "./redis.js";
import { FIXED_WINDOW, LIMITERS_CONFIG } from "./constants.js";

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
    res.json({
        defaultScheme: FIXED_WINDOW,
        limiters: LIMITERS_CONFIG,
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
