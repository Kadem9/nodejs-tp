const { Parser } = require('json2csv');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Locker = require('../models/Locker');

class ExportService {
    // Formater les données
    formatReservationForExport(reservation) {
        return {
            'ID reservation': reservation._id.toString(),
            'Utilisateur': reservation.user?.name || 'N/A',
            'Email Utilisateur': reservation.user?.email || 'N/A',
            'Casier': reservation.locker?.number || 'N/A',
            'Adresse': reservation.locker?.address ? 
                `${reservation.locker.address.street}, ${reservation.locker.address.postalCode} ${reservation.locker.address.city}` : 
                'N/A',
            'Date de debut': reservation.startTime ?
                new Date(reservation.startTime).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
            'Date de fin': reservation.endTime ? 
                new Date(reservation.endTime).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
            'Duree en h': reservation.duration || 0,
            'Prix total en euro': reservation.totalPrice ? reservation.totalPrice.toFixed(2) : '0.00',
            'Statut': this.translateStatus(reservation.status),
            'Statut Paiement': this.translatePaymentStatus(reservation.paymentStatus),
            'Date de creation': reservation.createdAt ?
                new Date(reservation.createdAt).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
            'Derniere modif': reservation.updatedAt ?
                new Date(reservation.updatedAt).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A'
        };
    }

   // ttaduire le status en fr
    translateStatus(status) {
        const statusMap = {
            'pending': 'En attente',
            'active': 'Active',
            'completed': 'Terminée',
            'cancelled': 'Annulée'
        };
        return statusMap[status] || status;
    }

    // traduire le payment en fr
    translatePaymentStatus(paymentStatus) {
        const paymentStatusMap = {
            'pending': 'En attente',
            'paid': 'Payé',
            'failed': 'Échoué',
            'refunded': 'Remboursé'
        };
        return paymentStatusMap[paymentStatus] || paymentStatus;
    }

   // exporter les resa en csv
    async exportReservationsToCSV(filters = {}) {
        try {
            // construire la requête avec filtres
            const query = {};
            
            if (filters.status) {
                query.status = filters.status;
            }
            
            if (filters.paymentStatus) {
                query.paymentStatus = filters.paymentStatus;
            }
            
            if (filters.userId) {
                query.user = filters.userId;
            }
            
            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) {
                    query.createdAt.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.createdAt.$lte = new Date(filters.endDate);
                }
            }

            // récupérer les réservations avec les relations
            const reservations = await Reservation.find(query)
                .populate('user', 'name email')
                .populate('locker', 'number address')
                .sort({ createdAt: -1 })
                .lean();

            if (!reservations || reservations.length === 0) {
                return {
                    success: false,
                    error: 'Aucune réservation trouvée avec les critères spécifiés'
                };
            }

            // formater les données pour l'export
            const formattedData = reservations.map(reservation => 
                this.formatReservationForExport(reservation)
            );

            // configuration du parser
            const csvFields = [
                'ID Réservation',
                'Utilisateur',
                'Email Utilisateur',
                'Casier',
                'Adresse',
                'Date de début',
                'Date de fin',
                'Durée (heures)',
                'Prix total (€)',
                'Statut',
                'Statut Paiement',
                'Date de création',
                'Dernière modification'
            ];

            const csvParser = new Parser({
                fields: csvFields,
                delimiter: ';',
                quote: '"',
                header: true
            });

            // on génère le nom de fichier avec timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `reservations_${timestamp}.csv`;

            return {
                success: true,
                csv: csv,
                filename: filename,
                count: reservations.length,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            return {
                success: false,
                error: 'Erreur lors de la génération du fichier CSV'
            };
        }
    }
// stats
    async exportReservationStats() {
        try {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const totalReservations = await Reservation.countDocuments();
            const activeReservations = await Reservation.countDocuments({ status: 'active' });
            const completedReservations = await Reservation.countDocuments({ status: 'completed' });
            const pendingReservations = await Reservation.countDocuments({ status: 'pending' });

            const paidReservations = await Reservation.countDocuments({ paymentStatus: 'paid' });
            const failedPayments = await Reservation.countDocuments({ paymentStatus: 'failed' });

            const totalRevenue = await Reservation.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const monthlyRevenue = await Reservation.aggregate([
                { 
                    $match: { 
                        paymentStatus: 'paid',
                        createdAt: { $gte: thisMonth }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const stats = {
                'Statistiques Generales': {
                    'Total des reservations': totalReservations,
                    'Reservations actives': activeReservations,
                    'Reservations terminees': completedReservations,
                    'Reservations en attente': pendingReservations
                },
                'Statistiques de Paiement': {
                    'Paiements reussis': paidReservations,
                    'Paiements echoues': failedPayments,
                    'Taux de reussite ( en %)': totalReservations > 0 ?
                        ((paidReservations / totalReservations) * 100).toFixed(2) : '0.00'
                },
                'Revenus': {
                    'Revenus totaux (en euro)': totalRevenue[0]?.total?.toFixed(2) || '0.00',
                    'Revenus ce mois (en euro)': monthlyRevenue[0]?.total?.toFixed(2) || '0.00'
                },
                'Export genere le': new Date().toLocaleString('fr-FR')
            };

            return {
                success: true,
                stats: stats
            };

        } catch (error) {
            console.error('Erreur lors de l\'export des statistiques:', error);
            return {
                success: false,
                error: 'Erreur lors de la génération des statistiques'
            };
        }
    }
}

module.exports = new ExportService(); 