import React, { useEffect, useState } from 'react';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Button, 
    Grid, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel,
    Box,
    Chip,
    IconButton,
    Fade,
    Zoom,
    Skeleton,
    Alert
} from '@mui/material';
import { 
    Storage as StorageIcon,
    AccessTime as AccessTimeIcon,
    Euro as EuroIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    BookOnline as BookOnlineIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';

const LockerList = () => {
    const [lockers, setLockers] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState({});
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState({});

    useEffect(() => {
        fetchLockers();
    }, []);

    const fetchLockers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/lockers');
            setLockers(data);
        } catch (error) {
            toast.error('Erreur lors du chargement des casiers');
        } finally {
            setLoading(false);
        }
    };

    const handleDurationChange = (lockerId, value) => {
        setSelectedDuration((prev) => ({
            ...prev,
            [lockerId]: value
        }));
    };

    const handleReservation = async (lockerId) => {
        const duration = selectedDuration[lockerId] || 1;
        if (!duration) {
            toast.error('Veuillez sélectionner une durée');
            return;
        }

        setReserving(prev => ({ ...prev, [lockerId]: true }));
        try {
            await api.post('/reservations', { lockerId, duration });
            toast.success('Casier réservé avec succès ! 🎉');
            fetchLockers();
        } catch (error) {
            toast.error('Erreur lors de la réservation');
            console.error(error.response?.data || error.message);
        } finally {
            setReserving(prev => ({ ...prev, [lockerId]: false }));
        }
    };

    const getStatusColor = (status) => {
        return status === 'reserved' ? 'error' : 'success';
    };

    const getStatusIcon = (status) => {
        return status === 'reserved' ? <CancelIcon /> : <CheckCircleIcon />;
    };

    const getLockerIcon = (size) => {
        const iconSize = size === 'large' ? 40 : size === 'medium' ? 32 : 24;
        return <StorageIcon sx={{ fontSize: iconSize }} />;
    };

    if (loading) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>Liste des casiers</Typography>
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 5, mb: 5 }}>
            <Fade in timeout={800}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                                Liste des casiers
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {lockers.length} casiers disponibles
                            </Typography>
                        </Box>
                        <IconButton 
                            onClick={fetchLockers}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                    transform: 'rotate(180deg)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>

                    {lockers.length === 0 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Aucun casier disponible pour le moment.
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {lockers.map((locker, index) => (
                            <Grid item xs={12} sm={6} md={4} key={locker._id}>
                                <Zoom in timeout={800 + index * 100}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'visible',
                                            background: locker.status === 'reserved' 
                                                ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                                                : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                            border: locker.status === 'reserved' 
                                                ? '2px solid #fecaca' 
                                                : '2px solid #bbf7d0',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: 16,
                                                zIndex: 1,
                                            }}
                                        >
                                            <Chip
                                                icon={getStatusIcon(locker.status)}
                                                label={locker.status === 'reserved' ? 'Réservé' : 'Disponible'}
                                                color={getStatusColor(locker.status)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        background: locker.status === 'reserved'
                                                            ? 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)'
                                                            : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2,
                                                    }}
                                                >
                                                    {getLockerIcon(locker.size)}
                                                </Box>
                                            </Box>

                                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                                                Casier #{locker.number}
                                            </Typography>

                                            <Box sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body1">
                                                        Taille : <strong>{locker.size}</strong>
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body1">
                                                        Prix : <strong>{locker.price} €</strong>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {locker.status === 'available' && (
                                                <Box>
                                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                                        <InputLabel>Durée de réservation</InputLabel>
                                                        <Select
                                                            value={selectedDuration[locker._id] || ''}
                                                            label="Durée de réservation"
                                                            onChange={(e) => handleDurationChange(locker._id, e.target.value)}
                                                            startAdornment={
                                                                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                            }
                                                        >
                                                            <MenuItem value={1}>1 heure</MenuItem>
                                                            <MenuItem value={2}>2 heures</MenuItem>
                                                            <MenuItem value={4}>4 heures</MenuItem>
                                                            <MenuItem value={8}>8 heures</MenuItem>
                                                            <MenuItem value={24}>24 heures</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => handleReservation(locker._id)}
                                                        disabled={reserving[locker._id]}
                                                        startIcon={reserving[locker._id] ? null : <BookOnlineIcon />}
                                                        sx={{
                                                            py: 1.5,
                                                            fontWeight: 600,
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                                            },
                                                        }}
                                                    >
                                                        {reserving[locker._id] ? 'Réservation...' : 'Réserver ce casier'}
                                                    </Button>
                                                </Box>
                                            )}

                                            {locker.status === 'reserved' && (
                                                <Alert severity="warning" sx={{ mt: 2 }}>
                                                    Ce casier est actuellement réservé
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default LockerList;
