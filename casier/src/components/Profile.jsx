import React, { useEffect, useState } from 'react';
import { Typography, Container } from '@mui/material';
import api from '../services/api';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (error) {
                console.error('Erreur de chargement du profil', error);
            }
        };

        fetchProfile();
    }, []);

    if (!user) {
        return <Typography>Chargement du profil...</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Profil Utilisateur</Typography>
            <Typography>Nom : {user.name}</Typography>
            <Typography>Email : {user.email}</Typography>
            <Typography>Rôle : {user.role}</Typography>
        </Container>
    );
};

export default Profile;
