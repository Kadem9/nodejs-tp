import React from 'react';
import { 
    Typography, 
    Container, 
    Button, 
    Box, 
    Card, 
    CardContent, 
    Avatar, 
    Chip,
    Grid,
    Divider,
    Fade,
    Zoom
} from '@mui/material';
import { 
    Person as PersonIcon,
    Email as EmailIcon,
    AdminPanelSettings as AdminIcon,
    Storage as StorageIcon,
    Logout as LogoutIcon,
    Edit as EditIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <Container sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Erreur lors du chargement du profil
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 5, mb: 5 }}>
            <Fade in timeout={800}>
                <Box>
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Zoom in timeout={1000}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
                            </Box>
                        </Zoom>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                            Mon Profil
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gérez vos informations personnelles
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={1200}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                Informations personnelles
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Nom complet
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {user.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Adresse email
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 3 }} />
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {user.role === 'admin' ? (
                                                    <AdminIcon sx={{ mr: 1, color: 'warning.main' }} />
                                                ) : (
                                                    <SecurityIcon sx={{ mr: 1, color: 'info.main' }} />
                                                )}
                                                <Typography variant="body2" color="text.secondary">
                                                    Rôle
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                                color={user.role === 'admin' ? 'warning' : 'info'}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={1400}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                            Actions rapides
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<StorageIcon />}
                                                onClick={() => navigate('/lockers')}
                                                sx={{
                                                    py: 2,
                                                    fontWeight: 600,
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                                    },
                                                }}
                                            >
                                                Voir les casiers disponibles
                                            </Button>
                                            
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<EditIcon />}
                                                onClick={() => navigate('/reservations')}
                                                sx={{
                                                    py: 2,
                                                    fontWeight: 600,
                                                    borderWidth: '2px',
                                                    '&:hover': {
                                                        borderWidth: '2px',
                                                    },
                                                }}
                                            >
                                                Mes réservations
                                            </Button>
                                            
                                            {user.role === 'admin' && (
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    startIcon={<AdminIcon />}
                                                    onClick={() => navigate('/admin/lockers')}
                                                    sx={{
                                                        py: 2,
                                                        fontWeight: 600,
                                                        borderWidth: '2px',
                                                        borderColor: 'warning.main',
                                                        color: 'warning.main',
                                                        '&:hover': {
                                                            borderWidth: '2px',
                                                            borderColor: 'warning.dark',
                                                            background: 'rgba(255, 152, 0, 0.04)',
                                                        },
                                                    }}
                                                >
                                                    Administration
                                                </Button>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 3 }} />
                                        
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            fullWidth
                                            startIcon={<LogoutIcon />}
                                            onClick={handleLogout}
                                            sx={{
                                                py: 2,
                                                fontWeight: 600,
                                                borderWidth: '2px',
                                                '&:hover': {
                                                    borderWidth: '2px',
                                                    background: 'rgba(244, 67, 54, 0.04)',
                                                },
                                            }}
                                        >
                                            Se déconnecter
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default Profile;
