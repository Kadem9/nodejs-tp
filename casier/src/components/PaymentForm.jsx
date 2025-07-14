import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentForm = ({ reservation, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [testMode, setTestMode] = useState(true);

  const handlePayment = async () => {
    if (!reservation) {
      toast.error('Aucune réservation à payer');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      if (testMode) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const confirmResponse = await api.post('/payments/confirm', {
          paymentIntentId: reservation._id
        });
        if (confirmResponse.data.success) {
          setPaymentStatus('success');
          toast.success('Paiement test effectué avec succès ! 🎉');
          if (onPaymentSuccess) {
            onPaymentSuccess(confirmResponse.data.reservation);
          }
        } else {
          throw new Error(confirmResponse.data.message);
        }
      } else {

        const paymentResponse = await api.post('/payments/create', {
          reservationId: reservation._id
        });

        if (!paymentResponse.data.success) {
          throw new Error(paymentResponse.data.message || 'Erreur lors de la création du paiement');
        }

        const { checkoutUrl } = paymentResponse.data;

        window.location.href = checkoutUrl;
      }

    } catch (error) {
      console.error('💥 Erreur lors du paiement:', error);
      console.error('💥 Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setPaymentStatus('error');
      setErrorMessage(error.message);
      toast.error(`Erreur de paiement: ${error.message}`);
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDuration = (duration) => {
    if (duration < 24) return `${duration}h`;
    const days = Math.floor(duration / 24);
    const hours = duration % 24;
    return hours > 0 ? `${days}j ${hours}h` : `${days}j`;
  };

  if (!reservation) {
    return (
      <Alert severity="info">
        Aucune réservation sélectionnée pour le paiement.
      </Alert>
    );
  }

  if (!reservation.locker) {
    return (
      <Alert severity="error">
        Erreur : Les données du casier ne sont pas disponibles.
      </Alert>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PaymentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Paiement sécurisé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Votre paiement est protégé par Stripe
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Mode test */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
          <FormControlLabel
            control={
              <Switch
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                🧪 Mode test (simulation de paiement)
              </Typography>
            }
          />
          <Typography variant="caption" color="text.secondary">
            Activez le mode test pour simuler un paiement sans Stripe
          </Typography>
        </Paper>

        {/* Détails de la réservation */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Détails de la réservation
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Casier #{reservation.locker.number}</Typography>
            <Chip 
              label={reservation.locker.size === 'small' ? 'Petit' : 
                     reservation.locker.size === 'medium' ? 'Moyen' : 'Grand'} 
              size="small" 
              color="primary" 
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Durée</Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatDuration(reservation.duration)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Prix unitaire</Typography>
            <Typography variant="body2">
              {reservation.locker?.price ? formatPrice(reservation.locker.price) : '3'}€/jour
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total à payer
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatPrice(reservation.totalPrice)}
            </Typography>
          </Box>
        </Paper>

        {/* Statut du paiement */}
        {paymentStatus === 'success' && (
          <Alert 
            icon={<CheckCircleIcon />} 
            severity="success" 
            sx={{ mb: 3 }}
          >
            Paiement effectué avec succès ! Votre casier est maintenant réservé.
          </Alert>
        )}

        {paymentStatus === 'error' && (
          <Alert 
            icon={<ErrorIcon />} 
            severity="error" 
            sx={{ mb: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Informations de paiement */}
        {!testMode && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              💳 Paiement sécurisé
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Vous serez redirigé vers la page de paiement sécurisée de Stripe pour effectuer votre paiement.
            </Typography>
          </Paper>
        )}

        {/* Bouton de paiement */}
        {paymentStatus !== 'success' && (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : 
                     testMode ? <PaymentIcon /> : <ShoppingCartIcon />}
            sx={{ 
              py: 1.5, 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: testMode 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              '&:hover': {
                background: testMode
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              }
            }}
          >
            {loading ? 'Traitement...' : 
             testMode ? 'Simuler le paiement' : 'Payer maintenant'}
          </Button>
        )}

        {/* Informations de sécurité */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Paiement sécurisé par Stripe
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentForm; 