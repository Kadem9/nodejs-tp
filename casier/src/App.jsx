import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import LockerList from './components/LockerList';
import ReservationList from './components/ReservationList';
import Navbar from './components/Navbar';
import LockerAdmin from './components/LockerAdmin';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Navbar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/lockers" element={
                    <ProtectedRoute>
                        <LockerList />
                    </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                    <ProtectedRoute>
                        <ReservationList />
                    </ProtectedRoute>
                } />
                <Route path="/payment/success" element={
                    <ProtectedRoute>
                        <PaymentSuccess />
                    </ProtectedRoute>
                } />
                <Route path="/payment/:reservationId" element={
                    <ProtectedRoute>
                        <PaymentPage />
                    </ProtectedRoute>
                } />
                
                <Route path="/admin/lockers" element={
                    <ProtectedRoute requireAdmin={true}>
                        <LockerAdmin />
                    </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
