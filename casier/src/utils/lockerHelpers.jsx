import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Storage as StorageIcon
} from '@mui/icons-material';

// retourne la couleur du statut d'un casier
export const getStatusColor = (status) => {
    switch (status) {
        case 'available':
            return '#059669';
        case 'reserved':
            return '#dc2626';
        case 'occupied':
            return '#7c3aed';
        case 'maintenance':
            return '#ea580c';
        default:
            return '#6b7280';
    }
};

// retourne l'icone
export const getStatusIcon = (status) => {
    switch (status) {
        case 'available':
            return <CheckCircleIcon />;
        case 'reserved':
        case 'occupied':
        case 'maintenance':
            return <CancelIcon />;
        default:
            return <CancelIcon />;
    }
};

// icone selon sa taille
export const getLockerIcon = (size) => {
    const iconSize = size === 'large' ? 40 : size === 'medium' ? 32 : 24;
    return <StorageIcon sx={{ fontSize: iconSize }} />;
};

// taille et texte casier
export const getSizeText = (size) => {
    switch (size) {
        case 'small':
            return 'Petit';
        case 'medium':
            return 'Moyen';
        case 'large':
            return 'Grand';
        default:
            return size;
    }
};

// statut
export const getStatusText = (status) => {
    switch (status) {
        case 'available':
            return 'Disponible';
        case 'reserved':
            return 'Réservé';
        case 'occupied':
            return 'Occupé';
        case 'maintenance':
            return 'Maintenance';
        default:
            return status;
    }
};

// type partnaire
export const getPartnerTypeText = (type) => {
    switch (type) {
        case 'commerce':
            return 'Commerce';
        case 'restaurant':
            return 'Restaurant';
        case 'service':
            return 'Service';
        default:
            return type;
    }
};

// nbr de casier dispo
export const getAvailableCount = (lockers) => {
    return lockers.filter(locker => locker.status === 'available').length;
};

// filtre
export const applyLockerFilters = (lockers, filters) => {
    let filtered = [...lockers];

    if (filters.searchTerm) {
        filtered = filtered.filter(locker => 
            locker.number.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
    }

    if (filters.sizeFilter) {
        filtered = filtered.filter(locker => locker.size === filters.sizeFilter);
    }

    if (filters.cityFilter) {
        filtered = filtered.filter(locker => 
            locker.address?.city === filters.cityFilter
        );
    }

    if (filters.statusFilter) {
        filtered = filtered.filter(locker => locker.status === filters.statusFilter);
    }

    if (filters.priceFilter) {
        filtered = filtered.filter(locker => 
            locker.price >= filters.priceFilter[0] && locker.price <= filters.priceFilter[1]
        );
    }

    return filtered;
}; 