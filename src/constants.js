export const SLIDING_WINDOW = "sliding_window";
export const TOKEN_BUCKET = "token_bucket";

export const DEFAULT_SCHEME = SLIDING_WINDOW;

export const RATE_LIMITER_SCHEMES = {
    SLIDING_WINDOW,
    TOKEN_BUCKET,
};

export const SLIDING_WINDOW_DEFAULTS = {
    max_requests_per_window: 10,
    window_size_in_ms: 60000,
};

export const TOKEN_BUCKET_DEFAULTS = {
    bucket_size: 5,
    refill_rate_in_ms: 1000,
};

export const LIMITERS_CONFIG = [
    {
        title: "Sliding Window",
        scheme: SLIDING_WINDOW,
        parameters: [
            {
                title: "Max Requests Per Window",
                id: "max_requests_per_window",
                defaultValue: SLIDING_WINDOW_DEFAULTS.max_requests_per_window,
            },
            {
                title: "Window Size",
                unit: "ms",
                id: "window_size_in_ms",
                defaultValue: SLIDING_WINDOW_DEFAULTS.window_size_in_ms,
            },
        ],
    },
    {
        title: "Token Bucket",
        scheme: TOKEN_BUCKET,
        parameters: [
            {
                title: "Bucket Size",
                id: "bucket_size",
                defaultValue: TOKEN_BUCKET_DEFAULTS.bucket_size,
            },
            {
                title: "Refill Rate",
                unit: "ms",
                id: "refill_rate_in_ms",
                defaultValue: TOKEN_BUCKET_DEFAULTS.refill_rate_in_ms,
            },
        ],
    },
];
