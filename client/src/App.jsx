import { useState } from "react";
import "./App.css";
import limit from "./services/limiter";
import LimiterForm from "./components/LimiterForm";

function App() {
    const [successfulRequests, setSuccessfulRequests] = useState(0);
    const [limitedRequests, setLimitedRequests] = useState(0);

    const [limiterConfig, setLimiterConfig] = useState();

    const handleLimit = async () => {
        const result = await limit(limiterConfig);
        if (result) {
            setSuccessfulRequests((sr) => sr + 1);
        } else {
            setSuccessfulRequests((sr) => sr + 1);
            setLimitedRequests((lr) => lr + 1);
        }
    };

    return (
        <>
            <LimiterForm handleFormSubmit={setLimiterConfig} />
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
