import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import React, { createContext, useState, useEffect } from 'react';


export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [credit, setCredit] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const loadCreditsData = async () => {
        if (!token) return;
        
        try {
            const { data } = await axios.get(backendUrl + '/api/user/credits', { headers: { token } });

            if (data.success) {
                setCredit(data.credits);
                setUser(data.user);
            } else {
                toast.error(data.message || "Failed to load credits");
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "An error occurred while fetching credits");
        }
    };

    const generateImage = async (prompt) => {
        if (!token) return;

        try {
            const { data } = await axios.post(backendUrl + '/api/image/generate-image', { prompt }, { headers: { token } });

            if (data.success) {
                loadCreditsData();
                return data.resultImage;
            } else {
                toast.error(data.message || "Failed to generate image");
                loadCreditsData();
                if (data.creditBalance === 0) {
                    navigate('/buy');
                }
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An error occurred while generating the image");
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (token) {
            loadCreditsData();
        }
    }, [token]);  // Only re-run when token changes

    const value = {
        token, setToken,
        user, setUser,
        showLogin, setShowLogin,
        credit, setCredit,
        loadCreditsData,
        backendUrl,
        generateImage,
        logout
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
