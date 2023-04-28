import { useState, useEffect, useRef } from "react";

export const useTimer = (initialTime = 0) => {
    const [time, setTime] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const countRef = useRef(null);

    const start = () => {
        setIsActive(true);
    };

    const pause = () => {
        setIsActive(false);
    };

    const reset = () => {
        setTime(initialTime);
        setIsActive(false);
    };

    useEffect(() => {
        if (isActive) {
            countRef.current = setInterval(() => {
                setTime((time) => time + 1);
            }, 1000);
        } else {
            clearInterval(countRef.current);
        }
        return () => clearInterval(countRef.current);
    }, [isActive]);

    return { time, start, pause, reset, isActive };
};

export default useTimer;
