import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            return toast.error('Les mots de passe ne correspondent pas');
        }

        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success('Mot de passe réinitialisé avec succès');
            navigate('/login');
        } catch (error) {
            toast.error('Erreur lors de la réinitialisation');
            console.error(error.response?.data || error.message);
        }
    };

    return (
        <Container sx={{ mt: 5 }} maxWidth="sm">
            <Typography variant="h4" gutterBottom>Réinitialiser le mot de passe</Typography>
            <TextField
                label="Nouveau mot de passe"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
                label="Confirmer le mot de passe"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>Valider</Button>
        </Container>
    );
};

export default ResetPassword;
