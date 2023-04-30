export const FIXED_WINDOW = "fixed_window";
export const SLIDING_WINDOW = "sliding_window";
export const TOKEN_BUCKET = "token_bucket";

export const DEFAULT_SCHEME = SLIDING_WINDOW;

export const RATE_LIMITER_SCHEMES = {
    SLIDING_WINDOW,
    TOKEN_BUCKET,
};

export const SLIDING_WINDOW_DEFAULTS = {
    maxRequestsPerWindow: 10,
    windowSizeInMs: 60000,
};

export const FIXED_WINDOW_DEFAULTS = {
    maxRequestsPerWindow: 10,
    windowSizeInMs: 60000,
};

export const TOKEN_BUCKET_DEFAULTS = {
    bucketSize: 5,
    refillRateInMs: 1000,
};

export const LIMITERS_CONFIG = [
    {
        title: "Fixed Window",
        scheme: FIXED_WINDOW,
        parameters: [
            {
                title: "Max Requests Per Window",
                id: "maxRequestsPerWindow",
                defaultValue: FIXED_WINDOW_DEFAULTS.maxRequestsPerWindow,
            },
            {
                title: "Window Size",
                unit: "ms",
                id: "windowSizeInMs",
                defaultValue: FIXED_WINDOW_DEFAULTS.windowSizeInMs,
            },
        ],
    },
    {
        title: "Sliding Window",
        scheme: SLIDING_WINDOW,
        parameters: [
            {
                title: "Max Requests Per Window",
                id: "maxRequestsPerWindow",
                defaultValue: SLIDING_WINDOW_DEFAULTS.maxRequestsPerWindow,
            },
            {
                title: "Window Size",
                unit: "ms",
                id: "windowSizeInMs",
                defaultValue: SLIDING_WINDOW_DEFAULTS.windowSizeInMs,
            },
        ],
    },
    {
        title: "Token Bucket",
        scheme: TOKEN_BUCKET,
        parameters: [
            {
                title: "Bucket Size",
                id: "bucketSize",
                defaultValue: TOKEN_BUCKET_DEFAULTS.bucketSize,
            },
            {
                title: "Refill Rate",
                unit: "ms",
                id: "refillRateInMs",
                defaultValue: TOKEN_BUCKET_DEFAULTS.refillRateInMs,
            },
        ],
    },
];
