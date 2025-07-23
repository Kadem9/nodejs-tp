import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    InputAdornment
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Search as SearchIcon
} from '@mui/icons-material';

// filtrage
const LockerFilters = ({ 
    filters, 
    onFilterChange, 
    filterOptions = {
        cities: ['Lyon', 'Villeurbanne'],
        sizes: ['small', 'medium', 'large'],
        statuses: ['available', 'reserved', 'occupied', 'maintenance']
    }
}) => {
    const {
        searchTerm,
        sizeFilter,
        cityFilter,
        statusFilter,
        priceFilter
    } = filters;

    const handleChange = (field, value) => {
        onFilterChange(field, value);
    };

    return (
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filtres
                </Typography>
            </Box>
            
            <Grid container spacing={2}>
                {/* Recherche par numéro */}
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        placeholder="Rechercher par numéro..."
                        value={searchTerm}
                        onChange={(e) => handleChange('searchTerm', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                {/* Filtre par taille */}
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                        <InputLabel>Taille</InputLabel>
                        <Select
                            value={sizeFilter}
                            label="Taille"
                            onChange={(e) => handleChange('sizeFilter', e.target.value)}
                        >
                            <MenuItem value="">Toutes les tailles</MenuItem>
                            {filterOptions.sizes.map(size => (
                                <MenuItem key={size} value={size}>
                                    {size === 'small' ? 'Petit' : 
                                     size === 'medium' ? 'Moyen' : 
                                     size === 'large' ? 'Grand' : size}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Filtre par ville */}
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                        <InputLabel>Ville</InputLabel>
                        <Select
                            value={cityFilter}
                            label="Ville"
                            onChange={(e) => handleChange('cityFilter', e.target.value)}
                        >
                            <MenuItem value="">Toutes les villes</MenuItem>
                            {filterOptions.cities.map(city => (
                                <MenuItem key={city} value={city}>
                                    {city}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Filtre par statut (optionnel) */}
                {filterOptions.statuses && (
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Statut"
                                onChange={(e) => handleChange('statusFilter', e.target.value)}
                            >
                                <MenuItem value="">Tous les statuts</MenuItem>
                                {filterOptions.statuses.map(status => (
                                    <MenuItem key={status} value={status}>
                                        {status === 'available' ? 'Disponible' :
                                         status === 'reserved' ? 'Réservé' :
                                         status === 'occupied' ? 'Occupé' :
                                         status === 'maintenance' ? 'Maintenance' : status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {/* Filtre par prix */}
                <Grid item xs={12} sm={filterOptions.statuses ? 12 : 3}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Prix : {priceFilter[0]}€ - {priceFilter[1]}€
                        </Typography>
                        <Slider
                            value={priceFilter}
                            onChange={(event, newValue) => handleChange('priceFilter', newValue)}
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
                                    backgroundColor: '#6366f1',
                                },
                                '& .MuiSlider-track': {
                                    backgroundColor: '#6366f1',
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
    );
};

export default LockerFilters; 