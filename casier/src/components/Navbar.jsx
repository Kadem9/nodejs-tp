import React, { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box, 
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Chip
} from '@mui/material';
import { 
    Storage as StorageIcon,
    BookOnline as BookOnlineIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Casiers', icon: <StorageIcon />, path: '/lockers' },
        { label: 'Réservations', icon: <BookOnlineIcon />, path: '/reservations' },
        { label: 'Profil', icon: <PersonIcon />, path: '/profile' },
    ];

    if (isAdmin()) {
        navItems.push({ label: 'Admin', icon: <AdminIcon />, path: '/admin/lockers' });
    }

    return (
        <AppBar 
            position="static" 
            elevation={0}
            sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
        >
            <Toolbar sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                px: { xs: 2, md: 4 },
                py: 1
            }}>
                <Box
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        }
                    }}
                    onClick={() => navigate('/profile')}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <StorageIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{ 
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        CasierApp
                    </Typography>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            color="inherit"
                            onClick={() => navigate(item.path)}
                            startIcon={item.icon}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-1px)',
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isAdmin() && (
                        <Chip
                            label="Admin"
                            size="small"
                            icon={<AdminIcon />}
                            sx={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        />
                    )}
                    
                    <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '&:hover': {
                                background: 'rgba(255,255,255,0.2)',
                            },
                        }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <PersonIcon />
                        </Avatar>
                    </IconButton>

                    <IconButton
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        sx={{ display: { md: 'none' } }}
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                </Box>
            </Toolbar>

            {mobileMenuOpen && (
                <Box
                    sx={{
                        display: { md: 'none' },
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Box sx={{ py: 2, px: 2 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.label}
                                fullWidth
                                color="inherit"
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileMenuOpen(false);
                                }}
                                startIcon={item.icon}
                                sx={{
                                    justifyContent: 'flex-start',
                                    py: 1.5,
                                    mb: 1,
                                    borderRadius: 2,
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                        <Button
                            fullWidth
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                py: 1.5,
                                borderRadius: 2,
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Déconnexion
                        </Button>
                    </Box>
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }
                }}
            >
                <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
                    <PersonIcon sx={{ mr: 2 }} />
                    Mon Profil
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    Déconnexion
                </MenuItem>
            </Menu>
        </AppBar>
    );
};

export default Navbar;
