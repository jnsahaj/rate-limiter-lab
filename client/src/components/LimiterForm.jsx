/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import { Button, Container, FormControl } from "@mui/material";

const LimiterForm = ({ handleFormSubmit }) => {
    const [selectedLimiter, setSelectedLimiter] = useState();
    const [limiters, setLimiters] = useState([]);

    const [formData, setFormData] = useState({});

    const handleFormChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    useEffect(() => {
        const fetchLimiters = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/limiters`
            );
            const data = await response.json();
            setLimiters(data);
            setSelectedLimiter(data[0]);
            setFormData({ scheme: data[0].scheme });
        };

        fetchLimiters();
    }, []);

    useEffect(() => {
        const tempFormData = {
            scheme: selectedLimiter?.scheme,
        };

        selectedLimiter?.parameters.forEach((parameter) => {
            tempFormData[parameter.id] = parameter.defaultValue;
        });

        setFormData(tempFormData);
    }, [selectedLimiter]);

    const handleChangeLimiter = (event) => {
        const scheme = event.target.value;
        const selected = limiters.find((limiter) => limiter.scheme === scheme);
        setSelectedLimiter(selected);
        setFormData({ scheme });
    };

    return (
        <Container maxWidth="xs">
            {selectedLimiter && (
                <>
                    <FormControl fullWidth sx={{ marginBottom: 5 }}>
                        <label>Scheme</label>
                        <Select
                            name="scheme"
                            value={selectedLimiter.scheme}
                            onChange={handleChangeLimiter}
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
                                    onChange={handleFormChange}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            {parameter.unit}
                                        </InputAdornment>
                                    }
                                    defaultValue={parameter.defaultValue}
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
                        Submit
                    </Button>
                </>
            )}
        </Container>
    );
};

export default LimiterForm;
