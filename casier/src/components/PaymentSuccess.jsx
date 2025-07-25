import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import { setAuthToken } from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      setAuthToken(localStorage.getItem('token'));
      try {
        if (!sessionId) {
          setError('Session ID manquant');
          setLoading(false);
          return;
        }

        const response = await api.get(`/payments/verify/${sessionId}`);
        
        if (response.data.success) {
          setReservation(response.data.reservation);
          toast.success('Paiement confirmé avec succès !');
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setError('Erreur lors de la vérification du paiement');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '—';
    
    if (duration >= 1 && duration <= 7) {
      return `${duration} jour(s)`;
    }
    
    if (duration < 24) return `${duration}h`;
    const days = Math.floor(duration / 24);
    const hours = duration % 24;
    return hours > 0 ? `${days}j ${hours}h` : `${days}j`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Vérification du paiement...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        {/* Header de succès */}
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
          Paiement réussi !
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Votre réservation a été confirmée et votre casier est maintenant réservé.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Détails de la réservation */}
        {reservation && (
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Détails de votre réservation
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Casier #{reservation.locker.number}</Typography>
              <Chip 
                label={reservation.locker.size === 'small' ? 'Petit' : 
                       reservation.locker.size === 'medium' ? 'Moyen' : 'Grand'} 
                color="primary" 
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Durée</Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatDuration(reservation.duration)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Adresse</Typography>
              <Typography variant="body1">
                {reservation.locker.address.street}, {reservation.locker.address.city}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Expire le</Typography>
              <Typography variant="body1" fontWeight="bold" color="warning.main">
                {new Date(reservation.endTime).toLocaleString('fr-FR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Montant payé
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatPrice(reservation.totalPrice)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/reservations')}
            startIcon={<ReceiptIcon />}
          >
            Mes réservations
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
          >
            Retour à l'accueil
          </Button>
        </Box>

        {/* Informations supplémentaires */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Un email de confirmation vous a été envoyé avec tous les détails de votre réservation.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentSuccess; 