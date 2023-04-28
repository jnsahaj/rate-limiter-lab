import { useState } from "react";
import "./App.css";
import limit from "./services/limiter";
import LimiterForm from "./components/LimiterForm";

function App() {
    const [successfulRequests, setSuccessfulRequests] = useState(0);
    const [limitedRequests, setLimitedRequests] = useState(0);

    const handleLimit = async () => {
        const result = await limit();
        if (result) {
            setSuccessfulRequests((sr) => sr + 1);
        } else {
            setSuccessfulRequests((sr) => sr + 1);
            setLimitedRequests((lr) => lr + 1);
        }
    };

    const handleLimiterConfigChange = async (limiterConfig) => {
        await fetch(`${import.meta.env.VITE_BASE_URL}/limit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(limiterConfig),
        });

        setLimitedRequests(0);
        setSuccessfulRequests(0);
    };

    return (
        <>
            <LimiterForm handleFormSubmit={handleLimiterConfigChange} />
            <div>
                <div>Total Requests</div>
                <div>{successfulRequests}</div>
            </div>

            <div>
                <div>Limited Requests</div>
                <div>{limitedRequests}</div>
            </div>

            <button onClick={handleLimit}>Click</button>
        </>
    );
}

export default App;
