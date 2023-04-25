import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import rateLimiter from "./rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "client")));
app.use(express.json());

app.get("/", rateLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, "/client/index.html"));
});

app.get("/limit", rateLimiter, (req, res) => {
    res.json({
        result: 1,
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
