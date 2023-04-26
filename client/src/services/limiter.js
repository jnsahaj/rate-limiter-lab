async function limit() {
    const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/limit?` +
            new URLSearchParams({
                scheme: "sliding_window",
                // bucket_size: 5,
                // refill_rate: 10000 * 1000,
            }),
        {
            method: "GET",
        }
    );
    // const data = await res.json();

    if (res.status === 429) {
        return false;
    }

    return true;
}

export default limit;
