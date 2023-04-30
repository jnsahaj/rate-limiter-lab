import { useState } from "react";
import "./App.css";
import limit from "./services/limiter";
import LimiterForm from "./components/LimiterForm";
import useTimer from "./hooks/useTimer";
import Grid from "@mui/material/Grid";

function App() {
    const [totalRequests, setTotalRequests] = useState(0);
    const [limitedRequests, setLimitedRequests] = useState(0);
    const { start, reset, isActive, time } = useTimer();
    const [firstRequestTimestamp, setFirstRequestTimestamp] = useState(0);

    // Timestamps: firstRequest, lastRequest, lastSuccessfulRequest, firstSuccessfulRequest

    const [timeDifference, setTimeDifference] = useState(0);

    const successfulRequestsPerMinute =
        (totalRequests - limitedRequests) / (timeDifference / (60 * 1000));

    const handleLimit = async () => {
        const result = await limit();
        if (result) {
            setTotalRequests((tr) => tr + 1);
        } else {
            setTotalRequests((tr) => tr + 1);
            setLimitedRequests((lr) => lr + 1);
        }
        if (!isActive) {
            start();
            setFirstRequestTimestamp(Date.now());
        } else {
            setTimeDifference(Date.now() - firstRequestTimestamp);
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
        setTotalRequests(0);
        reset();
    };

    return (
        <>
            <Grid
                container
                sx={{
                    height: "100%",
                }}
                alignItems="center"
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                        <LimiterForm
                            handleFormSubmit={handleLimiterConfigChange}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}
                        display="flex"
                        alignItems="flex-end"
                        flexDirection="column"
                        gap={1}
                    >
                        <div className="stat-cont">
                            <div className="stat-value">
                                <span>{totalRequests}</span>
                            </div>
                            <div className="stat-name">
                                <span>Total Requests</span>
                            </div>
                        </div>
                        <div className="stat-cont">
                            <div className="stat-value">
                                <span>{limitedRequests}</span>
                            </div>
                            <div className="stat-name">
                                <span>Limited Requests</span>
                            </div>
                        </div>
                        <div className="stat-cont">
                            <div className="stat-value">
                                <span>
                                    {successfulRequestsPerMinute.toFixed(2)}
                                </span>
                            </div>
                            <div className="stat-name">
                                <span>Successful Requests per Minute</span>
                            </div>
                        </div>
                        <div className="stat-cont">
                            <div className="stat-value">
                                <span>{time}</span>
                            </div>
                            <div className="stat-name">
                                <span>Time Elapsed</span>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="center">
                        <button onClick={handleLimit}>Click</button>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default App;
