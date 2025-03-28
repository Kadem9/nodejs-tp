import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Grid, Card, CardContent, Box } from '@mui/material';
import api from '../services/api';

const LockerAdmin = () => {
    const [lockers, setLockers] = useState([]);
    const [form, setForm] = useState({ number: '', size: '', price: '' });

    const fetchLockers = async () => {
        const { data } = await api.get('/lockers');
        setLockers(data);
    };

    useEffect(() => {
        fetchLockers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async () => {
        try {
            await api.post('/lockers', form);
            await fetchLockers();
            setForm({ number: '', size: '', price: '' });
        } catch (error) {
            alert('Erreur création casier');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce casier ?')) return;
        await api.delete(`/lockers/${id}`);
        await fetchLockers();
    };

    const handleUpdate = async (id) => {
        const updated = prompt('Nouveau prix ?');
        if (updated) {
            await api.put(`/lockers/${id}`, { price: updated });
            await fetchLockers();
        }
    };

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>Gestion des casiers</Typography>

            <Box sx={{ mb: 3 }}>
                <TextField label="Numéro" name="number" value={form.number} onChange={handleChange} sx={{ mr: 2 }} />
                <TextField label="Taille" name="size" value={form.size} onChange={handleChange} sx={{ mr: 2 }} />
                <TextField label="Prix (€)" name="price" type="number" value={form.price} onChange={handleChange} sx={{ mr: 2 }} />
                <Button variant="contained" onClick={handleCreate}>Créer</Button>
            </Box>

            <Grid container spacing={2}>
                {lockers.map(locker => (
                    <Grid item xs={12} sm={6} md={4} key={locker._id}>
                        <Card>
                            <CardContent>
                                <Typography><strong>Casier #{locker.number}</strong></Typography>
                                <Typography>Taille : {locker.size}</Typography>
                                <Typography>Prix : {locker.price} €</Typography>
                                <Typography>Statut : {locker.status}</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Button size="small" onClick={() => handleUpdate(locker._id)}>Modifier prix</Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(locker._id)}>Supprimer</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default LockerAdmin;
