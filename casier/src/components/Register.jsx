import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            setAuthToken(data.token);
            localStorage.setItem('token', data.token);
            onRegister();
            navigate('/profile');
        } catch (error) {
            alert('Échec de l’inscription');
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Inscription</Typography>
            <TextField
                label="Nom"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
            <Button variant="contained" onClick={handleRegister}>S’inscrire</Button>
        </Container>
    );
};

export default Register;
