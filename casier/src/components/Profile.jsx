import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from './Layout';

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/me');
                console.log('test 2');
                setUser(data);
            } catch (error) {
                toast.error("Erreur lors du chargement du profil");
                console.error('Erreur de chargement du profil', error);
                }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        toast.info("Déconnexion réussie");
        navigate('/login');
        console.log('test kadem');
    };

    if (!user) {
        return <Typography>Chargement...</Typography>;
    }

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Mon profil</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography><strong>Nom :</strong> {user.name}</Typography>
                    <Typography><strong>Email :</strong> {user.email}</Typography>
                    <Typography><strong>Rôle :</strong> {user.role}</Typography>
                </Box>

                <Button variant="outlined" sx={{ mt: 2, mr: 1 }} onClick={() => navigate('/lockers')}>
                    Voir les casiers
                </Button>
                <Button variant="contained" color="error" onClick={handleLogout}>
                    Déconnexion
                </Button>
            </Layout>
    );
};

export default Profile;
