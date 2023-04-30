function applyDefaults(options, defaults) {
    const result = { ...options };
    for (const [key, value] of Object.entries(defaults)) {
        if (
            typeof result[key] === "undefined" ||
            isNaN(parseInt(result[key]))
        ) {
            result[key] = value;
        }
    }
    return result;
}

export default applyDefaults;
