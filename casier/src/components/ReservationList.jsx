import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { data } = await api.get('/reservations');
                setReservations(data);
            } catch (error) {
                toast.error('Impossible de charger les réservations');
                console.error('Erreur lors du chargement des réservations', error);
            }
        };
        fetchReservations();
    }, []);

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>Mes Réservations</Typography>
            <Grid container spacing={2}>
                {reservations.map(res => (
                    <Grid item xs={12} sm={6} md={4} key={res._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Casier #{res.locker.number}</Typography>
                                <Typography>Taille : {res.locker.size}</Typography>
                                <Typography>Début : {new Date(res.startTime).toLocaleString()}</Typography>
                                <Typography>Fin : {new Date(res.endTime).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ReservationList;
