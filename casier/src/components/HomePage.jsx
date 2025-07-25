import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  LocationOn,
  Search,
  FilterList,
  Star,
  AccessTime,
  Security,
  Payment,
  Support,
  Map,
  ExpandMore,
  Login,
  PersonAdd
} from '@mui/icons-material';
import GoogleMap from './GoogleMap';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [lockers, setLockers] = useState([]);
  const [filteredLockers, setFilteredLockers] = useState([]);
  const [displayedLockers, setDisplayedLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 45.7640, lng: 4.8357 });
  
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [reservationDialog, setReservationDialog] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationDuration, setReservationDuration] = useState(24);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [visibleCount, setVisibleCount] = useState(9);
  const itemsPerPage = 9;
  
  const [filters, setFilters] = useState({
    city: '',
    neighborhood: '',
    size: '',
    maxPrice: 10,
    radius: 5
  });

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    lyon: 0,
    villeurbanne: 0
  });

  useEffect(() => {
    fetchLockers();
    fetchStats();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lockers, filters]);

  useEffect(() => {
    setDisplayedLockers(filteredLockers.slice(0, visibleCount));
  }, [filteredLockers, visibleCount]);

  const fetchLockers = async () => {
    try {
      const response = await api.get('/lockers');
      setLockers(response.data.data || []);
      setFilteredLockers(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des casiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/lockers/stats');
      const data = response.data.data;
      setStats({
        total: data.overall?.totalLockers || 0,
        available: data.overall?.availableLockers || 0,
        lyon: data.byCity?.find(city => city._id === 'Lyon')?.count || 0,
        villeurbanne: data.byCity?.find(city => city._id === 'Villeurbanne')?.count || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error);
        }
      );
    }
  };

  const applyFilters = () => {
    let filtered = [...lockers];

    if (filters.city) {
      filtered = filtered.filter(locker => locker.address.city === filters.city);
    }

    if (filters.neighborhood) {
      filtered = filtered.filter(locker => locker.address.neighborhood === filters.neighborhood);
    }

    if (filters.size) {
      filtered = filtered.filter(locker => locker.size === filters.size);
    }

    filtered = filtered.filter(locker => locker.price <= filters.maxPrice);

    setFilteredLockers(filtered);
    setVisibleCount(9);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + itemsPerPage);
  };

  const handleReserveClick = (locker) => {
    if (!isAuthenticated) {
      setSelectedLocker(locker);
      setReservationDialog(true);
    } else {
      handleReservation(locker);
    }
  };

  const handleReservation = async (locker) => {
    setReservationLoading(true);
    try {
      const response = await api.post('/reservations', {
        lockerId: locker._id,
        duration: Number(reservationDuration)
      });
      
      setSnackbar({
        open: true,
        message: response.data.message || `Réservation créée ! Redirection vers le paiement...`,
        severity: 'success'
      });
      
      setReservationDialog(false);
      setSelectedLocker(null);
      
      setTimeout(() => {
        navigate(`/payment/${response.data.reservation._id}`);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réservation. Veuillez réessayer.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setReservationLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    setReservationDialog(false);
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    setReservationDialog(false);
    navigate('/register');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'occupied': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Réservé';
      case 'occupied': return 'Occupé';
      default: return 'Inconnu';
    }
  };

  const getSizeText = (size) => {
    switch (size) {
      case 'small': return 'Petit';
      case 'medium': return 'Moyen';
      case 'large': return 'Grand';
      default: return size;
    }
  };

  const features = [
    {
      icon: <Security />,
      title: 'Sécurisé',
      description: 'Casiers en métal renforcé avec serrures électroniques'
    },
    {
      icon: <Payment />,
      title: 'Paiement sécurisé',
      description: 'Paiement en ligne sécurisé par notre partenaire bancaire'
    },
    {
      icon: <Support />,
      title: 'Assistance 7j/7',
      description: 'Hotline dédiée ouverte de 7h à 1h du matin'
    },
    {
      icon: <AccessTime />,
      title: 'Gestion à distance',
      description: 'Suivi instantané par notification à chaque ouverture'
    }
  ];

  const hasMoreLockers = displayedLockers.length < filteredLockers.length;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                Louez un casier à Lyon
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.95, color: 'white' }}>
                Des casiers connectés et sécurisés disponibles 7j/7 dans vos commerces de proximité
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold', color: 'white' }}>
                À partir de 3€/jour
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                startIcon={<Search />}
              >
                Trouver un casier
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <GoogleMap 
                lockers={filteredLockers.slice(0, 20)} 
                center={userLocation}
                zoom={12}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistiques */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 2,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white'
            }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Casiers total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 2,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white'
            }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {stats.available}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Disponibles
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 2,
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: 'white'
            }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {stats.lyon}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                À Lyon
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 2,
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              color: 'white'
            }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {stats.villeurbanne}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                À Villeurbanne
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Filtres et Liste */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                Casiers disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {displayedLockers.length} sur {filteredLockers.length} casiers affichés
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                Filtres
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Filtres */}
        {showFilters && (
          <Paper sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={filters.city}
                    label="Ville"
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    <MenuItem value="Lyon">Lyon</MenuItem>
                    <MenuItem value="Villeurbanne">Villeurbanne</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Taille</InputLabel>
                  <Select
                    value={filters.size}
                    label="Taille"
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    <MenuItem value="small">Petit</MenuItem>
                    <MenuItem value="medium">Moyen</MenuItem>
                    <MenuItem value="large">Grand</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                  Prix maximum: {filters.maxPrice}€
                </Typography>
                <Slider
                  value={filters.maxPrice}
                  onChange={(e, value) => handleFilterChange('maxPrice', value)}
                  min={1}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'grey.300',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Liste des casiers */}
        <Grid container spacing={3}>
          {displayedLockers.map((locker) => (
            <Grid item xs={12} md={6} lg={4} key={locker._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                      Casier {locker.number}
                    </Typography>
                    <Chip
                      label={getStatusText(locker.status)}
                      color={getStatusColor(locker.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {locker.address.street}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {locker.address.neighborhood}, {locker.address.city}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={getSizeText(locker.size)} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {locker.price}€/jour
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star color="warning" sx={{ mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      {locker.stats.averageRating.toFixed(1)} ({locker.stats.totalReservations} réservations)
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Partenaire: {locker.partner.name}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    disabled={locker.status !== 'available'}
                    onClick={() => handleReserveClick(locker)}
                    sx={{
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {locker.status === 'available' ? 'Réserver' : 'Indisponible'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bouton "Voir plus" */}
        {hasMoreLockers && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleLoadMore}
              startIcon={<ExpandMore />}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }
              }}
            >
              Voir {Math.min(itemsPerPage, filteredLockers.length - displayedLockers.length)} casiers de plus
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {displayedLockers.length} sur {filteredLockers.length} casiers affichés
            </Typography>
          </Box>
        )}

        {/* Message quand tous les casiers sont affichés */}
        {!hasMoreLockers && filteredLockers.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'medium' }}>
              Tous les casiers disponibles sont affichés
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredLockers.length} casiers au total
            </Typography>
          </Box>
        )}

        {/* Message quand aucun casier n'est trouvé */}
        {filteredLockers.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4, py: 6 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Aucun casier trouvé
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Essayez de modifier vos filtres pour voir plus de résultats
            </Typography>
          </Box>
        )}
      </Container>

      {/* Fonctionnalités */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Les facilités LockerLyon
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Absentez-vous l'esprit libre et contrôlez les allées et venues à distance
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Dialogue de réservation */}
      <Dialog 
        open={reservationDialog} 
        onClose={() => setReservationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {isAuthenticated ? 'Réserver un casier' : 'Connexion requise'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Casier #{selectedLocker?.number}
            </Typography>
            
            {selectedLocker && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Détails du casier :
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📍 {selectedLocker.address.street}, {selectedLocker.address.neighborhood}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  💰 {selectedLocker.price}€/jour
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📦 Taille : {getSizeText(selectedLocker.size)}
                </Typography>
                
                {isAuthenticated && (
                  <>
                    <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
                      Durée de réservation :
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Select
                        value={reservationDuration}
                        onChange={(e) => {
                          setReservationDuration(Number(e.target.value));
                        }}
                        size="small"
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
                    
                    <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="body2" fontWeight="medium">
                        Prix total : {Math.ceil((reservationDuration / 24) * selectedLocker.price * 100) / 100}€
                      </Typography>
                      <Typography variant="caption">
                        {reservationDuration < 24 ? `${reservationDuration}h` : 
                         reservationDuration === 24 ? '1 jour' : 
                         `${Math.floor(reservationDuration / 24)} jours`}
                      </Typography>
                    </Paper>
                  </>
                )}
              </Paper>
            )}
            
            {!isAuthenticated && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Vous devez être connecté pour réserver un casier. 
                Créez un compte ou connectez-vous pour continuer.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setReservationDialog(false)}
            sx={{ flex: 1 }}
          >
            Annuler
          </Button>
          
          {isAuthenticated ? (
            <Button
              variant="contained"
              onClick={() => handleReservation(selectedLocker)}
              disabled={reservationLoading}
              sx={{ flex: 1 }}
            >
              {reservationLoading ? 'Réservation...' : 'Confirmer la réservation'}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<Login />}
                onClick={handleLoginRedirect}
                sx={{ flex: 1, mr: 1 }}
              >
                Se connecter
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleRegisterRedirect}
                sx={{ flex: 1 }}
              >
                S'inscrire
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage; 