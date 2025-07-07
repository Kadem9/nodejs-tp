import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box, 
    Paper, 
    InputAdornment,
    Link,
    Fade,
    Zoom
} from '@mui/material';
import { 
    Email as EmailIcon, 
    Lock as LockIcon, 
    Login as LoginIcon,
    PersonAdd as PersonAddIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/profile';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleLogin = async () => {
        if (!email || !password) {
            return;
        }
        
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        
        if (result.success) {
            const from = location.state?.from?.pathname || '/profile';
            navigate(from, { replace: true });
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Fade in timeout={800}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: '80vh',
                        justifyContent: 'center',
                    }}
                >
                    <Zoom in timeout={1000}>
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                width: '100%',
                                maxWidth: 400,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                    }}
                                >
                                    <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    Connexion
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Accédez à votre espace personnel
                                </Typography>
                            </Box>

                            <Box component="form" sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Adresse email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Mot de passe"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 3 }}
                                />
                                
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    startIcon={loading ? null : <LoginIcon />}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        mb: 3,
                                    }}
                                >
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Pas encore de compte ?{' '}
                                        <Link
                                            href="/register"
                                            variant="body2"
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            Créer un compte
                                        </Link>
                                    </Typography>
                                    <Typography variant="body2">
                                        <Link
                                            href="/forgot-password"
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            <HelpIcon sx={{ fontSize: 16 }} />
                                            Mot de passe oublié ?
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Zoom>
                </Box>
            </Fade>
        </Container>
    );
};

export default Login;
