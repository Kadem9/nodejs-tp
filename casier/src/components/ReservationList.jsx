import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip, 
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete, AccessTime, LocationOn, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reservations/user');
            setReservations(response.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Erreur lors du chargement des réservations', error);
            setError('Impossible de charger vos réservations');
            toast.error('Impossible de charger les réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            await api.delete(`/reservations/${reservationId}`);
            toast.success('Réservation annulée avec succès');
            fetchReservations();
        } catch (error) {
            console.error('Erreur lors de l\'annulation', error);
            toast.error('Erreur lors de l\'annulation de la réservation');
        }
    };

    const getStatusColor = (reservation) => {
        if (reservation.status === 'pending') return 'warning';
        if (reservation.status === 'cancelled') return 'error';
        const now = new Date();
        const end = new Date(reservation.endTime);
        if (end < now) return 'error';
        if (end - now < 24 * 60 * 60 * 1000) return 'warning';
        return 'success';
    };

    const getStatusText = (reservation) => {
        if (reservation.status === 'pending') return 'En attente de paiement';
        if (reservation.status === 'cancelled') return 'Annulée';
        const now = new Date();
        const end = new Date(reservation.endTime);
        if (end < now) return 'Expirée';
        if (end - now < 24 * 60 * 60 * 1000) return 'Expire bientôt';
        return 'Active';
    };

    const formatDuration = (duration) => {
        if (duration < 24) return `${duration}h`;
        const days = Math.floor(duration / 24);
        const hours = duration % 24;
        return hours > 0 ? `${days}j ${hours}h` : `${days}j`;
    };

    if (loading) {
        return (
            <Container sx={{ mt: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Chargement de vos réservations...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                Mes Réservations
            </Typography>
            
            {reservations.length === 0 ? (
                <Alert severity="info">
                    Vous n'avez pas encore de réservations. 
                    <br />
                    Parcourez notre sélection de casiers pour en réserver un !
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {reservations.map(reservation => (
                        <Grid item xs={12} sm={6} md={4} key={reservation._id}>
                            <Card sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.3s ease'
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Casier #{reservation.locker.number}
                                        </Typography>
                                        <Chip 
                                            label={getStatusText(reservation)}
                                            color={getStatusColor(reservation)}
                                            size="small"
                                        />
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                                            {reservation.locker.address.street}, {reservation.locker.address.city}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Taille: {reservation.locker.size === 'small' ? 'Petit' : 
                                                    reservation.locker.size === 'medium' ? 'Moyen' : 'Grand'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <AccessTime sx={{ fontSize: 16, mr: 1 }} />
                                            Durée: {formatDuration(reservation.duration)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Début: {new Date(reservation.startTime).toLocaleString('fr-FR')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Fin: {new Date(reservation.endTime).toLocaleString('fr-FR')}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                
                                <Box sx={{ p: 2, pt: 0 }}>
                                    {reservation.status === 'pending' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<Payment />}
                                            onClick={() => navigate(`/payment/${reservation._id}`)}
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        >
                                            Payer maintenant
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<Delete />}
                                        onClick={() => handleCancelReservation(reservation._id)}
                                        fullWidth
                                        disabled={new Date(reservation.endTime) < new Date() || reservation.status === 'pending'}
                                    >
                                        Annuler
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ReservationList;
