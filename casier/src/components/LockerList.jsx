import React, { useEffect, useState } from 'react';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Button, 
    Grid, 
    Box,
    Chip,
    IconButton,
    Fade,
    Zoom,
    Skeleton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { 
    Storage as StorageIcon,
    AccessTime as AccessTimeIcon,
    Euro as EuroIcon,
    BookOnline as BookOnlineIcon,
    Refresh as RefreshIcon,
    Clear as ClearIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
    getStatusColor,
    getStatusIcon,
    getLockerIcon,
    getSizeText,
    getAvailableCount
} from '../utils/lockerHelpers.jsx';
import { useLockerFilters } from '../hooks/useLockerFilters.js';
import LockerFilters from './LockerFilters.jsx';

const LockerList = () => {
    const [lockers, setLockers] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState({});
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState({});

    const {
        searchTerm,
        setSearchTerm,
        sizeFilter,
        setSizeFilter,
        cityFilter,
        setCityFilter,
        priceFilter,
        setPriceFilter,
        filteredLockers,
        resetFilters
    } = useLockerFilters(lockers);

    useEffect(() => {
        fetchLockers();
    }, []);

    const fetchLockers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lockers');
            const lockersData = response.data.data || response.data || [];
            setLockers(lockersData);
        } catch (error) {
            console.error('Erreur lors du chargement des casiers:', error);
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
        const duration = selectedDuration[lockerId];
        if (!duration) {
            toast.error('Veuillez sélectionner une durée');
            return;
        }

        try {
            setReserving(prev => ({ ...prev, [lockerId]: true }));
            const response = await api.post('/reservations', {
                lockerId,
                duration
            });
            toast.success('Réservation créée avec succès !');
            fetchLockers();
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            toast.error('Erreur lors de la réservation');
        } finally {
            setReserving(prev => ({ ...prev, [lockerId]: false }));
        }
    };

    const getAvailableCountLocal = () => {
        return getAvailableCount(filteredLockers);
    };

    const handleResetFilters = () => {
        resetFilters();
        toast.success('Filtres réinitialisés !');
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
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                                Liste des casiers
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {getAvailableCountLocal()} casiers disponibles sur {filteredLockers.length} au total
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                                onClick={handleResetFilters}
                                sx={{
                                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <ClearIcon />
                            </IconButton>
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
                    </Box>

                    {/* Filtres */}
                    <LockerFilters
                        filters={{
                            searchTerm,
                            sizeFilter,
                            cityFilter,
                            priceFilter
                        }}
                        onFilterChange={(field, value) => {
                            switch (field) {
                                case 'searchTerm':
                                    setSearchTerm(value);
                                    break;
                                case 'sizeFilter':
                                    setSizeFilter(value);
                                    break;
                                case 'cityFilter':
                                    setCityFilter(value);
                                    break;
                                case 'priceFilter':
                                    setPriceFilter(value);
                                    break;
                                default:
                                    break;
                            }
                        }}
                        filterOptions={{
                            cities: ['Lyon', 'Villeurbanne'],
                            sizes: ['small', 'medium', 'large']
                        }}
                    />

                    {filteredLockers.length === 0 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Aucun casier ne correspond à vos critères de recherche.
                        </Alert>
                    )}

                    {/* Liste des casiers */}
                    <Grid container spacing={3}>
                        {filteredLockers.map((locker, index) => (
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
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                            },
                                            transition: 'all 0.3s ease',
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
                                                label={locker.status === 'available' ? 'Disponible' : 'Réservé'}
                                                color={getStatusColor(locker.status)}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                {getLockerIcon(locker.size)}
                                                <Typography variant="h5" sx={{ ml: 1, fontWeight: 700 }}>
                                                    Casier #{locker.number}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Taille : <strong>{getSizeText(locker.size)}</strong>
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Prix : <strong>{locker.price}€/jour</strong>
                                                </Typography>
                                                {locker.address && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {locker.address.street}, {locker.address.city}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {locker.status === 'available' && (
                                                <Box>
                                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                                        <Select
                                                            value={selectedDuration[locker._id] || ''}
                                                            onChange={(e) => handleDurationChange(locker._id, e.target.value)}
                                                            displayEmpty
                                                        >
                                                            <MenuItem value="" disabled>
                                                                Sélectionner une durée
                                                            </MenuItem>
                                                            <MenuItem value={1}>1 jour</MenuItem>
                                                            <MenuItem value={7}>1 semaine</MenuItem>
                                                            <MenuItem value={30}>1 mois</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        startIcon={<BookOnlineIcon />}
                                                        onClick={() => handleReservation(locker._id)}
                                                        disabled={!selectedDuration[locker._id] || reserving[locker._id]}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                                                            },
                                                        }}
                                                    >
                                                        {reserving[locker._id] ? 'Réservation...' : 'Réserver'}
                                                    </Button>
                                                </Box>
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
