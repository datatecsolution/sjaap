import { createContext, useState, useEffect, useCallback } from "react";
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch {
            setToken(null);
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, []);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            if (!user) fetchUser();
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        const data = response.data;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        const me = await api.get("/auth/me");
        setUser(me.data);
        localStorage.setItem("user", JSON.stringify(me.data));
        return true;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const isAdmin = user?.rol === "ADMIN";

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
