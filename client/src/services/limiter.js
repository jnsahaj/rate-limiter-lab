async function limit(parameters = {}) {
    const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/limit?` +
            new URLSearchParams(parameters),
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
