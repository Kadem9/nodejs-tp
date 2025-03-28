const Reservation = require('../models/Reservation');
const Locker = require('../models/Locker');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

const sendReminderEmail = async (reservation) => {
    const mailOptions = {
        from: 'noreply@reservation-casiers.com',
        to: reservation.user.email,
        subject: 'Rappel : Votre réservation de casier expire bientôt',
        text: `Bonjour ${reservation.user.name},\n\nVotre réservation du casier n°${reservation.locker.number} expire dans 15 minutes.\n\nMerci !`
    };

    await transporter.sendMail(mailOptions);
};

const checkReservations = async () => {
    try {
        const now = new Date();

        // expiration
        const expiredReservations = await Reservation.find({ endTime: { $lte: now } }).populate('locker');

        for (const reservation of expiredReservations) {
            const locker = reservation.locker;
            locker.status = 'available';
            await locker.save();

            await Reservation.findByIdAndDelete(reservation._id);
            console.log(`Casier ${locker.number} libéré`);
        }

        // rappel 15 min avant expiration
        const reminderTime = new Date(now.getTime() + (15 * 60 * 1000));
        const upcomingReservations = await Reservation.find({
            endTime: { $lte: reminderTime, $gt: now },
            reminderSent: false
        }).populate('user').populate('locker');

        for (const reservation of upcomingReservations) {
            await sendReminderEmail(reservation);
            reservation.reminderSent = true;
            await reservation.save();
            console.log(`Rappel envoyé pour casier ${reservation.locker.number}`);
        }

    } catch (error) {
        console.error('Erreur lors de la vérification des réservations:', error);
    }
};

module.exports = { checkReservations };
