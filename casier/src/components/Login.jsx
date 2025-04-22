import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuthToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            toast.success('Connexion réussie');
            onLogin();
            navigate('/profile');
        } catch (error) {
            toast.error('Identifiants incorrects');
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Connexion</Typography>
            <TextField 
                label="Email" 
                fullWidth 
                margin="normal" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <TextField 
                label="Mot de passe" 
                type="password" 
                fullWidth 
                margin="normal" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <Button variant="contained" onClick={handleLogin}>Se connecter</Button>
            <Typography variant="body2" style={{ marginTop: '16px' }}>
                Pas encore de compte ? <a href="/register" style={{ color: 'blue', cursor: 'pointer' }}>Créer un compte</a>
            </Typography>
            <Typography variant="body2" style={{ marginTop: '8px' }}>
                Mot de passe oublié ? <a href="/forgot-password" style={{ color: 'blue', cursor: 'pointer' }}>Réinitialiser</a>
            </Typography>
        </Container>
    );
};

export default Login;
