async function limit() {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/limit?`, {
        method: "GET",
    });
    // const data = await res.json();

    if (res.status === 429) {
        return false;
    }

    return true;
}

export default limit;
