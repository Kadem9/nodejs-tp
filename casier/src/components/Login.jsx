import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuthToken(data.token);
            localStorage.setItem('token', data.token);
            onLogin();
            navigate('/profile');
        } catch (error) {
            alert('Échec de la connexion');
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
        </Container>
    );
};

export default Login;
