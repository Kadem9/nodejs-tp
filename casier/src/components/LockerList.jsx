import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Button, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const LockerList = () => {
    const [lockers, setLockers] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState({});

    useEffect(() => {
        const fetchLockers = async () => {
            const { data } = await api.get('/lockers');
            setLockers(data);
        };
        fetchLockers();
    }, []);

    const handleDurationChange = (lockerId, value) => {
        setSelectedDuration((prev) => ({
            ...prev,
            [lockerId]: value
        }));
    };

    const handleReservation = async (lockerId) => {
        try {
            const duration = selectedDuration[lockerId] || 1; // par défaut : 1h
            await api.post('/reservations', { lockerId, duration });
            toast.success('Casier réservé avec succès');
        } catch (error) {
            toast.error('Erreur lors de la réservation');
            console.error(error.response?.data || error.message);
        }
    };

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>Liste des casiers</Typography>
            <Grid container spacing={2}>
                {lockers.map(locker => (
                    <Grid item xs={12} sm={6} md={4} key={locker._id}>
                        <Card sx={{ backgroundColor: locker.status === 'reserved' ? '#ffcdd2' : '#c8e6c9' }}>
                            <CardContent>
                                <Typography variant="h6">Casier #{locker.number}</Typography>
                                <Typography>Taille : {locker.size}</Typography>
                                <Typography>Prix : {locker.price} €</Typography>
                                <Typography>Statut : {locker.status === 'reserved' ? 'Réservé' : 'Disponible'}</Typography>

                                {locker.status === 'available' && (
                                    <>
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel>Durée</InputLabel>
                                            <Select
                                                value={selectedDuration[locker._id] || ''}
                                                label="Durée"
                                                onChange={(e) => handleDurationChange(locker._id, e.target.value)}
                                            >
                                                <MenuItem value={1}>1 heure</MenuItem>
                                                <MenuItem value={2}>2 heures</MenuItem>
                                                <MenuItem value={4}>4 heures</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => handleReservation(locker._id)}
                                        >
                                            Réserver
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default LockerList;
