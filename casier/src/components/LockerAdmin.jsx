import React, { useEffect, useState } from 'react';
import { 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    Fade,
    Zoom,
    Skeleton,
    InputAdornment,
    Slider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Storage as StorageIcon,
    Euro as EuroIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    FileDownload as FileDownloadIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
    getStatusColor,
    getStatusText,
    getSizeText,
    getPartnerTypeText,
    applyLockerFilters
} from '../utils/lockerHelpers.jsx';

const LockerAdmin = () => {
    const [lockers, setLockers] = useState([]);
    const [filteredLockers, setFilteredLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingLocker, setEditingLocker] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState([0, 50]); // [min, max]

    const [createForm, setCreateForm] = useState({
        number: '',
        size: 'medium',
        price: '',
        status: 'available',
        address: {
            street: '',
            city: 'Lyon',
            postalCode: '',
            neighborhood: ''
        },
        partner: {
            name: '',
            type: 'commerce',
            phone: '',
            email: ''
        },
        location: {
            coordinates: [4.8357, 45.7640] //lyon
        }
    });

    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchLockers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [lockers, searchTerm, cityFilter, statusFilter, priceFilter]);

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
        const filters = {
            searchTerm,
            cityFilter,
            statusFilter,
            priceFilter
        };
        const filtered = applyLockerFilters(lockers, filters);
        setFilteredLockers(filtered);
    };

    const handleCreateChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setCreateForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setCreateForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleEditChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCreate = async () => {
        try {
            if (!createForm.number || !createForm.price || !createForm.address.street) {
                toast.error('Veuillez remplir tous les champs obligatoires');
                return;
            }

            await api.post('/lockers', createForm);
            await fetchLockers();
            setCreateForm({
                number: '',
                size: 'medium',
                price: '',
                status: 'available',
                address: {
                    street: '',
                    city: 'Lyon',
                    postalCode: '',
                    neighborhood: ''
                },
                partner: {
                    name: '',
                    type: 'commerce',
                    phone: '',
                    email: ''
                },
                location: {
                    coordinates: [4.8357, 45.7640]
                }
            });
            setCreateDialogOpen(false);
            toast.success('Casier créé avec succès');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            toast.error('Erreur lors de la création du casier');
        }
    };
    
    const handleEdit = (locker) => {
        setEditingLocker(locker);
        setEditForm({
            number: locker.number,
            size: locker.size,
            price: locker.price,
            status: locker.status,
            address: { ...locker.address },
            partner: { ...locker.partner },
            location: { ...locker.location }
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/lockers/${editingLocker._id}`, editForm);
            await fetchLockers();
            setEditDialogOpen(false);
            setEditingLocker(null);
            toast.success('Casier mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            toast.error('Erreur lors de la mise à jour du casier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer casier ?')) {
            try {
                await api.delete(`/lockers/${id}`);
                toast.success('Casier supprimé avec succès !');
                fetchLockers();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get('/export/reservations', {
                responseType: 'blob'
            });

            // lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // nom du fichier dans les headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'reservations.csv';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export CSV téléchargé avec succès !');
        } catch (error) {
            toast.error('Erreur lors de l\'export CSV');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setCityFilter('');
        setStatusFilter('');
        setPriceFilter([0, 50]);
        toast.success('Filtres réinitialisés !');
    };

    if (loading) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>Administration des casiers</Typography>
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
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
                                Administration des casiers
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {filteredLockers.length} casiers affichés sur {lockers.length} au total
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={handleExportCSV}
                                sx={{
                                    borderColor: '#059669',
                                    color: '#059669',
                                    '&:hover': {
                                        borderColor: '#047857',
                                        backgroundColor: 'rgba(5, 150, 105, 0.04)',
                                    },
                                }}>
                                Export CSV
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={handleResetFilters}
                                sx={{
                                    borderColor: '#dc2626',
                                    color: '#dc2626',
                                    '&:hover': {
                                        borderColor: '#b91c1c',
                                        backgroundColor: 'rgba(220, 38, 38, 0.04)',
                                    },
                                }}>
                                Réinitialiser
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateDialogOpen(true)}
                                sx={{
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                                    },
                                }}
                            >
                                Nouveau casier
                            </Button>
                        </Box>
            </Box>

                    <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Filtres
                            </Typography>
                        </Box>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Rechercher par numéro"
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
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Ville</InputLabel>
                                    <Select
                                        value={cityFilter}
                                        onChange={(e) => setCityFilter(e.target.value)}
                                        label="Ville"
                                    >
                                        <MenuItem value="">Toutes les villes</MenuItem>
                                        <MenuItem value="Lyon">Lyon</MenuItem>
                                        <MenuItem value="Villeurbanne">Villeurbanne</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Statut"
                                    >
                                        <MenuItem value="">Tous les statuts</MenuItem>
                                        <MenuItem value="available">Disponible</MenuItem>
                                        <MenuItem value="reserved">Réservé</MenuItem>
                                        <MenuItem value="occupied">Occupé</MenuItem>
                                        <MenuItem value="maintenance">Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Prix : {priceFilter[0]}€ - {priceFilter[1]}€
                                    </Typography>
                                    <Slider
                                        value={priceFilter}
                                        onChange={(event, newValue) => setPriceFilter(newValue)}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={50}
                                        step={1}
                                        marks={[
                                            { value: 0, label: '0€' },
                                            { value: 25, label: '25€' },
                                            { value: 50, label: '50€' }
                                        ]}
                                        sx={{
                                            '& .MuiSlider-thumb': {
                                                backgroundColor: '#059669',
                                            },
                                            '& .MuiSlider-track': {
                                                backgroundColor: '#059669',
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: '#e5e7eb',
                                            },
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Grid container spacing={3}>
                        {filteredLockers.map(locker => (
                    <Grid item xs={12} sm={6} md={4} key={locker._id}>
                                <Zoom in timeout={300}>
                                    <Card sx={{ 
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                        }
                                    }}>
                            <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                        Casier #{locker.number}
                                                    </Typography>
                                                    <Chip 
                                                        label={getStatusText(locker.status)}
                                                        color={getStatusColor(locker.status)}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEdit(locker)}
                                                        sx={{ color: 'primary.main' }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDelete(locker._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <StorageIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {getSizeText(locker.size)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <EuroIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {locker.price} €/jour
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                    <Typography variant="body2" noWrap>
                                                        {locker.address?.street}, {locker.address?.city}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <BusinessIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                    <Typography variant="body2" noWrap>
                                                        {locker.partner?.name || 'Aucun partenaire'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {locker.stats && (
                                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {locker.stats.totalReservations || 0} réservations
                                                    </Typography>
                                </Box>
                                            )}
                            </CardContent>
                        </Card>
                                </Zoom>
                    </Grid>
                ))}
            </Grid>

                    {filteredLockers.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                Aucun casier trouvé
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Fade>

            <Dialog
                open={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Créer un nouveau casier</Typography>
                        <IconButton onClick={() => setCreateDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Informations de base</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Numéro *"
                                name="number"
                                value={createForm.number}
                                onChange={(e) => handleCreateChange('number', e.target.value)}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Taille *</InputLabel>
                                <Select
                                    value={createForm.size}
                                    onChange={(e) => handleCreateChange('size', e.target.value)}
                                    label="Taille *"
                                >
                                    <MenuItem value="small">Petit</MenuItem>
                                    <MenuItem value="medium">Moyen</MenuItem>
                                    <MenuItem value="large">Grand</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Prix (€/jour) *"
                                name="price"
                                value={createForm.price}
                                onChange={(e) => handleCreateChange('price', e.target.value)}
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Adresse</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Rue *"
                                name="address.street"
                                value={createForm.address.street}
                                onChange={(e) => handleCreateChange('address.street', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Ville *</InputLabel>
                                <Select
                                    value={createForm.address.city}
                                    onChange={(e) => handleCreateChange('address.city', e.target.value)}
                                    label="Ville *"
                                >
                                    <MenuItem value="Lyon">Lyon</MenuItem>
                                    <MenuItem value="Villeurbanne">Villeurbanne</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Code postal"
                                name="address.postalCode"
                                value={createForm.address.postalCode}
                                onChange={(e) => handleCreateChange('address.postalCode', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Quartier"
                                name="address.neighborhood"
                                value={createForm.address.neighborhood}
                                onChange={(e) => handleCreateChange('address.neighborhood', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Partenaire</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nom du partenaire"
                                name="partner.name"
                                value={createForm.partner.name}
                                onChange={(e) => handleCreateChange('partner.name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={createForm.partner.type}
                                    onChange={(e) => handleCreateChange('partner.type', e.target.value)}
                                    label="Type"
                                >
                                    <MenuItem value="commerce">Commerce</MenuItem>
                                    <MenuItem value="bureau">Bureau</MenuItem>
                                    <MenuItem value="residence">Résidence</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Téléphone"
                                name="partner.phone"
                                value={createForm.partner.phone}
                                onChange={(e) => handleCreateChange('partner.phone', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="partner.email"
                                value={createForm.partner.email}
                                onChange={(e) => handleCreateChange('partner.email', e.target.value)}
                                type="email"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreate} variant="contained">Créer</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editDialogOpen} 
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Modifier le casier #{editingLocker?.number}</Typography>
                        <IconButton onClick={() => setEditDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Informations de base</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Numéro"
                                name="number"
                                value={editForm.number || ''}
                                onChange={(e) => handleEditChange('number', e.target.value)}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Taille</InputLabel>
                                <Select
                                    value={editForm.size || ''}
                                    onChange={(e) => handleEditChange('size', e.target.value)}
                                    label="Taille"
                                >
                                    <MenuItem value="small">Petit</MenuItem>
                                    <MenuItem value="medium">Moyen</MenuItem>
                                    <MenuItem value="large">Grand</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Prix (€/jour)"
                                name="price"
                                value={editForm.price || ''}
                                onChange={(e) => handleEditChange('price', e.target.value)}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={editForm.status || ''}
                                    onChange={(e) => handleEditChange('status', e.target.value)}
                                    label="Statut"
                                >
                                    <MenuItem value="available">Disponible</MenuItem>
                                    <MenuItem value="reserved">Réservé</MenuItem>
                                    <MenuItem value="occupied">Occupé</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Adresse</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Rue"
                                name="address.street"
                                value={editForm.address?.street || ''}
                                onChange={(e) => handleEditChange('address.street', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Ville</InputLabel>
                                <Select
                                    value={editForm.address?.city || ''}
                                    onChange={(e) => handleEditChange('address.city', e.target.value)}
                                    label="Ville"
                                >
                                    <MenuItem value="Lyon">Lyon</MenuItem>
                                    <MenuItem value="Villeurbanne">Villeurbanne</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Code postal"
                                name="address.postalCode"
                                value={editForm.address?.postalCode || ''}
                                onChange={(e) => handleEditChange('address.postalCode', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Quartier"
                                name="address.neighborhood"
                                value={editForm.address?.neighborhood || ''}
                                onChange={(e) => handleEditChange('address.neighborhood', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Partenaire</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nom du partenaire"
                                name="partner.name"
                                value={editForm.partner?.name || ''}
                                onChange={(e) => handleEditChange('partner.name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={editForm.partner?.type || ''}
                                    onChange={(e) => handleEditChange('partner.type', e.target.value)}
                                    label="Type"
                                >
                                    <MenuItem value="commerce">Commerce</MenuItem>
                                    <MenuItem value="bureau">Bureau</MenuItem>
                                    <MenuItem value="residence">Résidence</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Téléphone"
                                name="partner.phone"
                                value={editForm.partner?.phone || ''}
                                onChange={(e) => handleEditChange('partner.phone', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="partner.email"
                                value={editForm.partner?.email || ''}
                                onChange={(e) => handleEditChange('partner.email', e.target.value)}
                                type="email"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleUpdate} variant="contained">Mettre à jour</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LockerAdmin;
