import { useState, useEffect } from 'react';
import { applyLockerFilters } from '../utils/lockerHelpers.jsx';

// hook pr gérer les filtres
export const useLockerFilters = (lockers) => {
    // États des filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState([0, 50]);

    // État des casiers filtrés
    const [filteredLockers, setFilteredLockers] = useState([]);

    useEffect(() => {
        const filters = {
            searchTerm,
            sizeFilter,
            cityFilter,
            statusFilter,
            priceFilter
        };
        
        const filtered = applyLockerFilters(lockers, filters);
        setFilteredLockers(filtered);
    }, [lockers, searchTerm, sizeFilter, cityFilter, statusFilter, priceFilter]);

// reset
const resetFilters = () => {
        setSearchTerm('');
        setSizeFilter('');
        setCityFilter('');
        setStatusFilter('');
        setPriceFilter([0, 50]);
    };

    return {
        searchTerm,
        setSearchTerm,
        sizeFilter,
        setSizeFilter,
        cityFilter,
        setCityFilter,
        statusFilter,
        setStatusFilter,
        priceFilter,
        setPriceFilter,
        filteredLockers,
        resetFilters
    };
}; 