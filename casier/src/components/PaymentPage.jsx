import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import PaymentForm from './PaymentForm';
import api from '../services/api';
import { toast } from 'react-toastify';

const steps = [
  'Réservation créée',
  'Paiement en cours',
  'Paiement confirmé'
];

const PaymentPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (
      reservationId &&
      reservationId !== 'success' &&
      reservationId !== 'cancel'
    ) {
      fetchReservation();
    }
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reservations/${reservationId}`);
      
      if (response.data.success) {
        setReservation(response.data.data);
        
        if (response.data.data.paymentStatus === 'paid') {
          setActiveStep(2);
        } else if (response.data.data.paymentStatus === 'pending') {
          setActiveStep(0);
        }
      } else {
        setError('Réservation non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la réservation:', error);
      setError('Impossible de charger la réservation');
      toast.error('Erreur lors du chargement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedReservation) => {
    setReservation(updatedReservation);
    setActiveStep(2);
    toast.success('Paiement effectué avec succès !');
    
    setTimeout(() => {
      navigate('/reservations');
    }, 3000);
  };

  const handlePaymentError = (error) => {
    console.error('Erreur de paiement:', error);
    setActiveStep(0);
  };

  const handleBackToReservations = () => {
    navigate('/reservations');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de votre réservation...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleBackToReservations}>
          Retour aux réservations
        </Button>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="info">
          Aucune réservation trouvée.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Finaliser votre réservation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sécurisez votre casier en effectuant le paiement
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                icon={
                  index === 0 ? <ScheduleIcon /> :
                  index === 1 ? <PaymentIcon /> :
                  <CheckCircleIcon />
                }
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Contenu principal */}
      <Grid container spacing={4}>
        {/* Informations de la réservation */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Détails de la réservation
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Numéro de réservation
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                #{reservation._id.slice(-8).toUpperCase()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Casier
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                #{reservation.locker.number}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Adresse
              </Typography>
              <Typography variant="body1">
                {reservation.locker.address.street}
                <br />
                {reservation.locker.address.city}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Durée
              </Typography>
              <Typography variant="body1">
                {reservation.duration >= 1 && reservation.duration <= 7 ? `${reservation.duration} jour(s)` :
                 reservation.duration < 24 ? `${reservation.duration}h` :
                 reservation.duration === 24 ? '1 jour' :
                 `${Math.floor(reservation.duration / 24)} jours`}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Statut du paiement
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: reservation.paymentStatus === 'paid' ? 'success.main' : 
                         reservation.paymentStatus === 'pending' ? 'warning.main' : 'error.main'
                }}
              >
                {reservation.paymentStatus === 'paid' ? 'Payé' :
                 reservation.paymentStatus === 'pending' ? 'En attente' : 'Échoué'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Montant total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(reservation.totalPrice)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Formulaire de paiement */}
        <Grid item xs={12} md={8}>
          {reservation.paymentStatus === 'paid' ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Paiement confirmé !
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Votre réservation est maintenant active. Vous recevrez un email de confirmation.
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleBackToReservations}
                sx={{ mr: 2 }}
              >
                Voir mes réservations
              </Button>
            </Paper>
          ) : (
            <PaymentForm
              reservation={reservation}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </Grid>
      </Grid>

      {/* Informations de sécurité */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Sécurité et confidentialité
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          • Vos informations de paiement sont chiffrées et sécurisées par Stripe
          <br />
          • Nous ne stockons jamais vos données de carte bancaire
          <br />
          • Tous les paiements sont protégés par la norme PCI DSS
          <br />
          • Vous pouvez annuler votre réservation dans les 24h suivant le paiement
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentPage; 