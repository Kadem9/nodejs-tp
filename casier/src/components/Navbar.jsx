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
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    CasierApp
                </Typography>
                <Box>
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
