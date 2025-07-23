const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

const emailTemplates = {
    reservationCreated: (user, reservation, locker) => {
        // Formater l'adresse du casier
        const address = locker.address ? `${locker.address.street}, ${locker.address.postalCode} ${locker.address.city}` : 'Adresse non disponible';
        
        // Formater les dates
        const startDate = reservation.startTime ? new Date(reservation.startTime).toLocaleString('fr-FR') : 'Date non disponible';
        const endDate = reservation.endTime ? new Date(reservation.endTime).toLocaleString('fr-FR') : 'Date non disponible';
        
        return {
            subject: 'Réservation créée - Paiement en attente',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1976d2;">Bonjour ${user.name} !</h2>
                    
                    <p>Votre réservation a été créée avec succès !</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Détails de la réservation</h3>
                        <p><strong>Casier :</strong> N°${locker.number}</p>
                        <p><strong>Adresse :</strong> ${address}</p>
                        <p><strong>Date de début :</strong> ${startDate}</p>
                        <p><strong>Date de fin :</strong> ${endDate}</p>
                        <p><strong>Durée :</strong> ${reservation.duration} heures</p>
                        <p><strong>Montant :</strong> ${reservation.totalPrice}€</p>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
                        <p><strong>Paiement en attente</strong></p>
                        <p>Pour confirmer votre réservation, veuillez procéder au paiement dans les 15 minutes.</p>
                    </div>
                    
                    <p>Merci de votre confiance !</p>
                </div>
            `
        };
    },

    paymentConfirmed: (user, reservation, locker) => {
        // Formater l'adresse du casier
        const address = locker.address ? `${locker.address.street}, ${locker.address.postalCode} ${locker.address.city}` : 'Adresse non disponible';
        
        // Formater les dates
        const startDate = reservation.startTime ? new Date(reservation.startTime).toLocaleString('fr-FR') : 'Date non disponible';
        const endDate = reservation.endTime ? new Date(reservation.endTime).toLocaleString('fr-FR') : 'Date non disponible';
        
        return {
            subject: 'Paiement confirmé - Réservation active',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2e7d32;">Paiement confirmé !</h2>
                    
                    <p>Bonjour ${user.name},</p>
                    
                    <p>Votre paiement a été traité avec succès. Votre réservation est maintenant active !</p>
                    
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Réservation confirmée</h3>
                        <p><strong>Casier :</strong> N°${locker.number}</p>
                        <p><strong>Adresse :</strong> ${address}</p>
                        <p><strong>Date de début :</strong> ${startDate}</p>
                        <p><strong>Date de fin :</strong> ${endDate}</p>
                        <p><strong>Durée :</strong> ${reservation.duration} heures</p>
                        <p><strong>Montant payé :</strong> ${reservation.totalPrice}€</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 5px;">
                        <p><strong>Accès au casier</strong></p>
                        <p>Vous pouvez maintenant accéder à votre casier avec le code : <strong>${locker.accessCode || '1234'}</strong></p>
                    </div>
                    
                    <p>Bonne utilisation !</p>
                </div>
            `
        };
    },

    expirationReminder: (user, reservation, locker) => {
        // Formater l'adresse du casier
        const address = locker.address ? `${locker.address.street}, ${locker.address.postalCode} ${locker.address.city}` : 'Adresse non disponible';
        
        // Formater la date d'expiration
        const expireDate = reservation.endTime ? new Date(reservation.endTime).toLocaleString('fr-FR') : 'Date non disponible';
        
        return {
            subject: 'Rappel : Votre casier expire dans 15 minutes',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f57c00;">Rappel d'expiration</h2>
                    
                    <p>Bonjour ${user.name},</p>
                    
                    <p>Votre réservation de casier expire dans <strong>15 minutes</strong>.</p>
                    
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Détails de la réservation</h3>
                        <p><strong>Casier :</strong> N°${locker.number}</p>
                        <p><strong>Adresse :</strong> ${address}</p>
                        <p><strong>Expire le :</strong> ${expireDate}</p>
                    </div>
                    
                    <div style="background: #ffebee; padding: 15px; border-radius: 5px;">
                        <p><strong>Important</strong></p>
                        <p>N'oubliez pas de récupérer vos affaires avant l'expiration !</p>
                    </div>
                    
                    <p>Merci !</p>
                </div>
            `
        };
    },

    reservationExpired: (user, reservation, locker) => {
        // Formater l'adresse du casier
        const address = locker.address ? `${locker.address.street}, ${locker.address.postalCode} ${locker.address.city}` : 'Adresse non disponible';
        
        // Formater la date d'expiration
        const expireDate = reservation.endTime ? new Date(reservation.endTime).toLocaleString('fr-FR') : 'Date non disponible';
        
        return {
            subject: 'Votre réservation de casier a expiré',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d32f2f;">Réservation expirée</h2>
                    
                    <p>Bonjour ${user.name},</p>
                    
                    <p>Votre réservation de casier a expiré.</p>
                    
                    <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Réservation terminée</h3>
                        <p><strong>Casier :</strong> N°${locker.number}</p>
                        <p><strong>Adresse :</strong> ${address}</p>
                        <p><strong>Expiré le :</strong> ${expireDate}</p>
                    </div>
                    
                    <p>Nous espérons que votre expérience a été satisfaisante !</p>
                    <p>N'hésitez pas à nous faire une nouvelle réservation.</p>
                </div>
            `
        };
    },

    paymentFailed: (user, reservation, locker) => {
        // Formater l'adresse du casier
        const address = locker.address ? `${locker.address.street}, ${locker.address.postalCode} ${locker.address.city}` : 'Adresse non disponible';
        
        return {
            subject: 'Échec du paiement - Réservation annulée',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d32f2f;">Paiement échoué</h2>
                    
                    <p>Bonjour ${user.name},</p>
                    
                    <p>Le paiement pour votre réservation a échoué. Votre réservation a été annulée.</p>
                    
                    <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Réservation annulée</h3>
                        <p><strong>Casier :</strong> N°${locker.number}</p>
                        <p><strong>Adresse :</strong> ${address}</p>
                        <p><strong>Montant :</strong> ${reservation.totalPrice}€</p>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
                        <p><strong>Nouvelle réservation</strong></p>
                        <p>Vous pouvez créer une nouvelle réservation à tout moment.</p>
                    </div>
                    
                    <p>Si vous pensez qu'il s'agit d'une erreur, contactez-nous.</p>
                </div>
            `
        };
    },

    passwordReset: (user, resetUrl) => ({
        subject: 'Réinitialisation de mot de passe',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1976d2;">Réinitialisation de mot de passe</h2>
                
                <p>Bonjour ${user.name},</p>
                
                <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</strong></p>
                    <a href="${resetUrl}" style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <p><strong>Ce lien expire dans 1 heure.</strong></p>
                
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
        `
    })
};

class EmailService {
    async sendEmail(to, templateName, data) {
        try {
            const template = emailTemplates[templateName];
            if (!template) {
                throw new Error(`Template '${templateName}' non trouvé`);
            }

            const { subject, html } = template(...data);

            const mailOptions = {
                from: 'noreply@reservation-casiers.com',
                to: to,
                subject: subject,
                html: html
            };

            const info = await transporter.sendMail(mailOptions);

            return { success: true, messageId: info.messageId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendReservationCreated(user, reservation, locker) {
        return this.sendEmail(user.email, 'reservationCreated', [user, reservation, locker]);
    }

    async sendPaymentConfirmed(user, reservation, locker) {
        return this.sendEmail(user.email, 'paymentConfirmed', [user, reservation, locker]);
    }

    async sendExpirationReminder(user, reservation, locker) {
        return this.sendEmail(user.email, 'expirationReminder', [user, reservation, locker]);
    }

    async sendReservationExpired(user, reservation, locker) {
        return this.sendEmail(user.email, 'reservationExpired', [user, reservation, locker]);
    }

    async sendPaymentFailed(user, reservation, locker) {
        return this.sendEmail(user.email, 'paymentFailed', [user, reservation, locker]);
    }

    async sendPasswordReset(user, resetUrl) {
        return this.sendEmail(user.email, 'passwordReset', [user, resetUrl]);
    }

    async sendTestEmail(to = 'test@adrien.fr') {
        const testData = {
            name: 'Utilisateur Test',
            email: to
        };
        
        return this.sendEmail(to, 'reservationCreated', [
            testData,
            {
                startDate: new Date(),
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                totalPrice: 15
            },
            {
                number: 'A1',
                location: 'Lyon Centre',
                accessCode: '1234'
            }
        ]);
    }
}

module.exports = new EmailService(); 