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
    Alert,
    TextField,
    InputAdornment,
    Paper,
    Divider
} from '@mui/material';
import { 
    Storage as StorageIcon,
    AccessTime as AccessTimeIcon,
    Euro as EuroIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    BookOnline as BookOnlineIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    LocationOn as LocationIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';

const LockerList = () => {
    const [lockers, setLockers] = useState([]);
    const [filteredLockers, setFilteredLockers] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState({});
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => {
        fetchLockers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [lockers, searchTerm, sizeFilter, cityFilter]);

    const fetchLockers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lockers');
            const lockersData = response.data.data || response.data || [];
            setLockers(lockersData);
            setFilteredLockers(lockersData);
        } catch (error) {
            console.error('Erreur lors du chargement des casiers:', error);
            toast.error('Erreur lors du chargement des casiers');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...lockers];

        if (searchTerm) {
            filtered = filtered.filter(locker => 
                locker.number.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sizeFilter) {
            filtered = filtered.filter(locker => locker.size === sizeFilter);
        }

        if (cityFilter) {
            filtered = filtered.filter(locker => 
                locker.address?.city === cityFilter
            );
        }

        setFilteredLockers(filtered);
    };

    const handleDurationChange = (lockerId, value) => {
        setSelectedDuration((prev) => ({
            ...prev,
            [lockerId]: value
        }));
    };

    const handleReservation = async (lockerId) => {
        const duration = selectedDuration[lockerId] || 24;
        if (!duration) {
            toast.error('Veuillez sélectionner une durée');
            return;
        }

        setReserving(prev => ({ ...prev, [lockerId]: true }));
        try {
            const response = await api.post('/reservations', { lockerId, duration });
            toast.success(response.data.message || 'Casier réservé avec succès ! 🎉');
            fetchLockers();
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la réservation';
            toast.error(errorMessage);
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

    const getSizeText = (size) => {
        switch (size) {
            case 'small': return 'Petit';
            case 'medium': return 'Moyen';
            case 'large': return 'Grand';
            default: return size;
        }
    };

    const getAvailableCount = () => {
        return filteredLockers.filter(locker => locker.status === 'available').length;
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
                                {getAvailableCount()} casiers disponibles sur {filteredLockers.length} au total
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

                    {/* Filtres */}
                    <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Filtres
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Rechercher par numéro..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Taille</InputLabel>
                                    <Select
                                        value={sizeFilter}
                                        label="Taille"
                                        onChange={(e) => setSizeFilter(e.target.value)}
                                    >
                                        <MenuItem value="">Toutes les tailles</MenuItem>
                                        <MenuItem value="small">Petit</MenuItem>
                                        <MenuItem value="medium">Moyen</MenuItem>
                                        <MenuItem value="large">Grand</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Ville</InputLabel>
                                    <Select
                                        value={cityFilter}
                                        label="Ville"
                                        onChange={(e) => setCityFilter(e.target.value)}
                                    >
                                        <MenuItem value="">Toutes les villes</MenuItem>
                                        <MenuItem value="Lyon">Lyon</MenuItem>
                                        <MenuItem value="Villeurbanne">Villeurbanne</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

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
                                                        Taille : <strong>{getSizeText(locker.size)}</strong>
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body1">
                                                        Prix : <strong>{locker.price}€/jour</strong>
                                                    </Typography>
                                                </Box>
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
                                                        <InputLabel>Durée de réservation</InputLabel>
                                                        <Select
                                                            value={selectedDuration[locker._id] || 24}
                                                            label="Durée de réservation"
                                                            onChange={(e) => handleDurationChange(locker._id, e.target.value)}
                                                            startAdornment={
                                                                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                            }
                                                        >
                                                            <MenuItem value={1}>1 heure</MenuItem>
                                                            <MenuItem value={6}>6 heures</MenuItem>
                                                            <MenuItem value={12}>12 heures</MenuItem>
                                                            <MenuItem value={24}>1 jour</MenuItem>
                                                            <MenuItem value={48}>2 jours</MenuItem>
                                                            <MenuItem value={72}>3 jours</MenuItem>
                                                            <MenuItem value={168}>1 semaine</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                                                        <Typography variant="body2" color="white" sx={{ fontWeight: 600 }}>
                                                            Prix total : {Math.ceil((selectedDuration[locker._id] || 24) / 24 * locker.price * 100) / 100}€
                                                        </Typography>
                                                    </Box>

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
