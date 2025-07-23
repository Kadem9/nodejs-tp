const exportService = require('../services/exportService');

// exports
exports.exportReservations = async (req, res) => {
    try {
        const filters = {};
        
        // filtres autorisés
        const allowedFilters = ['status', 'paymentStatus', 'startDate', 'endDate', 'userId'];
        
        for (const filter of allowedFilters) {
            if (req.query[filter]) {
                filters[filter] = req.query[filter];
            }
        }

        // validation des dates
        if (filters.startDate && isNaN(Date.parse(filters.startDate))) {
            return res.status(400).json({
                success: false,
                error: 'Format de date de début invalide'
            });
        }

        if (filters.endDate && isNaN(Date.parse(filters.endDate))) {
            return res.status(400).json({
                success: false,
                error: 'Format de date de fin invalide'
            });
        }

        // validation du statut
        const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
        if (filters.status && !validStatuses.includes(filters.status)) {
            return res.status(400).json({
                success: false,
                error: 'Statut invalide'
            });
        }

        // validation du statut de paiement
        const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (filters.paymentStatus && !validPaymentStatuses.includes(filters.paymentStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Statut de paiement invalide'
            });
        }

        // export les données
        const result = await exportService.exportReservationsToCSV(filters);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }

        // on configure les headers pour le téléchargement
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // envoie du fichier CSV
        res.send(result.csv);

    } catch (error) {
        console.error('Erreur export réservations:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'export des réservations'
        });
    }
};

exports.exportStats = async (req, res) => {
    try {
        const result = await exportService.exportReservationStats();

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            data: result.stats
        });

    } catch (error) {
        console.error('Erreur export statistiques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'export des statistiques'
        });
    }
};

// par utilisateur
exports.exportUserReservations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'ID utilisateur requis'
            });
        }

        const filters = { userId };
        const result = await exportService.exportReservationsToCSV(filters);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }

        // on configure les headers pour le téléchargement
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reservations_utilisateur_${userId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv"`);
        res.setHeader('Cache-Control', 'no-cache');

        res.send(result.csv);

    } catch (error) {
        console.error('Erreur export réservations utilisateur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'export des réservations utilisateur'
        });
    }
}; 