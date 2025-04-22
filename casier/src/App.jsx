import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import LockerList from './components/LockerList';
import ReservationList from './components/ReservationList';
import Navbar from './components/Navbar';
import { setAuthToken } from './services/api';
import LockerAdmin from './components/LockerAdmin';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';


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

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <ToastContainer position="top-right" autoClose={3000} />
                {isAuthenticated && <Navbar onLogout={handleLogout} />}

                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLoginOrRegister} />} />
                    <Route path="/register" element={<Register onRegister={handleLoginOrRegister} />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/lockers" element={isAuthenticated ? <LockerList /> : <Navigate to="/login" />} />
                    <Route path="/reservations" element={isAuthenticated ? <ReservationList /> : <Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />
                    <Route path="/admin/lockers" element={isAuthenticated && localStorage.getItem('role') === 'admin'
                            ? <LockerAdmin />
                            : <Navigate to="/login" />
                    } />

                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
