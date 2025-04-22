import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success("E-mail de réinitialisation envoyé !");

            setSent(true);
        } catch (error) {
            toast.error("Une erreur est survenue. Vérifie l'email.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>Mot de passe oublié</Typography>
            {sent ? (
                <Typography>Un e-mail de réinitialisation t’a été envoyé !</Typography>
            ) : (
                <>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleSubmit}>Envoyer</Button>
                </>
            )}
        </Container>
    );
};

export default ForgotPassword;
