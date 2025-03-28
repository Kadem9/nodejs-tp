require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

const testEmail = async () => {
    const mailOptions = {
        from: 'noreply@reservation-casiers.com',
        to: 'test@example.com',
        subject: 'Test - Réservation Casiers',
        text: `mail de test`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✉️ E-mail de test envoyé:', info);
    } catch (error) {
        console.error('Erreur lors de l’envoi du test e-mail:', error);
    }
};

testEmail();
