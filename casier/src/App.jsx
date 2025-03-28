import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import { setAuthToken } from './services/api';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginOrRegister = () => {
        setIsAuthenticated(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLoginOrRegister} />} />
                <Route path="/register" element={<Register onRegister={handleLoginOrRegister} />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />
            </Routes>
        </Router>
    );
};

export default App;
