import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
        navigate('/login');
    };

    return (
        <AppBar position="static" color="primary" elevation={1}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Typography
                    variant="h6"
                    onClick={() => navigate('/profile')}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                >
                    🧊 CasierApp
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button color="inherit" onClick={() => navigate('/lockers')}>Casiers</Button>
                    <Button color="inherit" onClick={() => navigate('/reservations')}>Réservations</Button>
                    <Button color="inherit" onClick={() => navigate('/profile')}>Profil</Button>
                    {localStorage.getItem('role') === 'admin' && (
                        <Button color="inherit" onClick={() => navigate('/admin/lockers')}>Admin</Button>
                    )}
                    <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
