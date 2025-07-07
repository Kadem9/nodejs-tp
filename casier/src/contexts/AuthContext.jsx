import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token trouvé:', token ? 'Oui' : 'Non');
            
            if (token) {
                setAuthToken(token);
                
                const response = await api.get('/auth/me');

                setUser(response.data);
                setIsAuthenticated(true);
                console.log(response.data);
            } else {
                console.log('Aucun token trouvé dans le localStorage');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            console.error('Détails de l\'erreur:', error.response?.data || error.message);
            clearAuthData();
        } finally {
            setLoading(false);
        }
    };

    const clearAuthData = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        setAuthToken(null);
        
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = async (email, password) => {
        try {
            console.log('Tentative de connexion...');
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            
            console.log('Connexion réussie, données reçues:', { token: !!token, user: userData });
            
            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            
            setAuthToken(token);
            
            setUser(userData);
            setIsAuthenticated(true);
            
            toast.success('Connexion réussie !');
            return { success: true };
        } catch (error) {
            toast.error('Identifiants incorrects');
            return { success: false, error: error.response?.data?.message || 'Erreur de connexion' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { token, user: userData } = response.data;
            
            console.log('Inscription réussie, données reçus:', { token: !!token, user: userData });
            
            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            
            setAuthToken(token);
            
            setUser(userData);
            setIsAuthenticated(true);
            
            toast.success('Inscription réussie !');
            return { success: true };
        } catch (error) {
            console.error(' Erreur d\'inscription:', error);
            toast.error('Échec de l\'inscription');
            return { success: false, error: error.response?.data?.message || 'Erreur d\'inscription' };
        }
    };

    const logout = () => {
        console.log('déconnexion...');
        clearAuthData();
        toast.info('Déconnexion réussie');
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 