/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import { Button, Container, FormControl } from "@mui/material";

const LimiterForm = ({ handleFormSubmit }) => {
    const [selectedLimiter, setSelectedLimiter] = useState();
    const [limiters, setLimiters] = useState([]);
    const [defaultLimiterScheme, setDefaultLimiterScheme] = useState();

    const [formData, setFormData] = useState({});

    const handleFormChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleChangeLimiter = (scheme) => {
        const selected = limiters.find((limiter) => limiter.scheme === scheme);
        setSelectedLimiter(selected);

        const tempFormData = {
            scheme: selected?.scheme,
        };

        selected?.parameters.forEach((parameter) => {
            tempFormData[parameter.id] = parameter.defaultValue;
        });

        setFormData(tempFormData);
    };

    useEffect(() => {
        const fetchLimiters = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/limiters`
            );
            const data = await response.json();

            // Set the default limiter scheme state value
            setDefaultLimiterScheme(data.defaultScheme);

            // Set the limiters state value
            setLimiters(data.limiters);
        };

        fetchLimiters();
    }, []);

    // Handle setting the selected limiter when the limiters or default limiter scheme change
    useEffect(() => {
        if (defaultLimiterScheme && limiters.length > 0) {
            handleChangeLimiter(defaultLimiterScheme);
        }
    }, [defaultLimiterScheme, limiters]);

    return (
        <Container maxWidth="xs">
            {selectedLimiter && (
                <>
                    <FormControl fullWidth sx={{ marginBottom: 5 }}>
                        <label>Scheme</label>
                        <Select
                            name="scheme"
                            value={selectedLimiter.scheme}
                            onChange={(event) =>
                                handleChangeLimiter(event.target.value)
                            }
                        >
                            {limiters.map((limiter) => {
                                return (
                                    <MenuItem
                                        key={limiter.scheme}
                                        value={limiter.scheme}
                                    >
                                        {limiter.title}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    {selectedLimiter.parameters.map((parameter) => {
                        return (
                            <FormControl
                                key={parameter.id}
                                fullWidth
                                sx={{ marginBottom: 5 }}
                            >
                                <label>{parameter.title}</label>
                                <OutlinedInput
                                    value={formData[parameter?.id]}
                                    onChange={handleFormChange}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            {parameter.unit}
                                        </InputAdornment>
                                    }
                                    inputProps={{
                                        name: parameter?.id,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    aria-describedby="outlined-weight-helper-text"
                                />
                            </FormControl>
                        );
                    })}

                    <Button onClick={() => handleFormSubmit(formData)}>
                        Submit & Reset
                    </Button>
                </>
            )}
        </Container>
    );
};

export default LimiterForm;
