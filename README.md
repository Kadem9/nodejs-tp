# Application de réservations de casiers

Application pour la gestion et réservation de casiers avec système de paiement intégré stripe

## Fonctionnalités

### Authentification
- Inscription et connexion utilisateur
- Gestion des mots de passe (oubli/réinitialisation)
- Protection des routes avec JWT
- Profil utilisateur

### Gestion des Casiers
- Affichage de la liste des casiers disponibles
- Système de réservation avec sélection de durée
- Calcul automatique des prix
- Statuts en temps réel (disponible/occupé/réservé)

### Système de Paiement
- Intégration Stripe Checkout
- Paiement sécurisé avec redirection
- Gestion des webhooks pour confirmation
- Mode test et production
- Page de confirmation de paiement

### Notifications par Email
- Emails automatiques
- Notifications de réservation créée (paiement en attente)
- Confirmation de paiement
- Rappels d'expiration (15 min avant)
- Notifications de fin de réservation
- Emails d'échec de paiement
- Réinitialisation de mot de passe

### Administration
- Interface admin pour gestion des casiers
- CRUD pour les casiers (création, modification, suppression)
- Filtres et recherche avancés
- Gestion des réservations
- Statistiques en temps réel
- Export CSV des réservations avec filtres
- Export des stats de performance

## Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- MongoDB
- Compte Stripe (pour les paiements)

### Backend
```bash
# Installation des dépendances
npm install

# Configuration de la base de données
# Modifier src/config/db.js avec vos paramètres MongoDB

# Variables d'environnement
# Créer un fichier .env avec :
# MONGODB_URI=votre_uri_mongodb
# JWT_SECRET=votre_secret_jwt
# STRIPE_SECRET_KEY=votre_cle_stripe
# STRIPE_WEBHOOK_SECRET=votre_webhook_secret
# MAILTRAP_USER=votre_user_mailtrap
# MAILTRAP_PASS=votre_pass_mailtrap

# Lancement du serveur
npx nodemon src/index.js
```

### Frontend
```bash
# Aller dans le dossier casier
cd casier

# Installation des dépendances
npm install

# Lancement de l'application
npm run dev
```

## Structure du Projet

### Backend
```
src/
├── config/
│   └── db.js                    # Configuration MongoDB
├── controllers/
│   ├── authController.js        # Contrôleurs d'authentification
│   ├── lockerController.js      # Contrôleurs des casiers
│   ├── reservationController.js # Contrôleurs des réservations
│   └── paymentController.js     # Contrôleurs des paiements
├── middleware/
│   ├── authMiddleware.js        # Middleware d'authentification
│   └── adminMiddleware.js       # Middleware admin
├── models/
│   ├── User.js                  # Modèle utilisateur
│   ├── Locker.js                # Modèle casier
│   └── Reservation.js           # Modèle réservation
├── routes/
│   ├── authRoutes.js            # Routes d'authentification
│   ├── lockerRoutes.js          # Routes des casiers
│   ├── reservationRoutes.js     # Routes des réservations
│   └── paymentRoutes.js         # Routes des paiements
├── services/
│   ├── reservationService.js    # Services de réservation
│   ├── stripeService.js         # Services Stripe
│   ├── emailService.js          # Service de notifications par email
│   └── exportService.js         # Service d'export CSV
├── scripts/
│   ├── seedLockers.js           # Script de génération de casiers
│   ├── testEmail.js             # Script de test email
│   ├── testEmailService.js      # Script de test du service email
│   ├── sendReminders.js         # Script d'envoi des rappels
│   └── testExport.js            # Script de test export CSV
└── index.js                     # Point d'entrée du serveur
```

### Frontend
```
casier/src/
├── components/
│   ├── Login.jsx                # Page de connexion
│   ├── Register.jsx             # Page d'inscription
│   ├── ForgotPassword.jsx       # Page mot de passe oublié
│   ├── ResetPassword.jsx        # Page réinitialisation
│   ├── Profile.jsx              # Page profil utilisateur
│   ├── HomePage.jsx             # Page d'accueil
│   ├── LockerList.jsx           # Liste des casiers
│   ├── LockerAdmin.jsx          # Interface admin des casiers
│   ├── ReservationList.jsx      # Liste des réservations
│   ├── PaymentForm.jsx          # Formulaire de paiement
│   ├── PaymentPage.jsx          # Page de paiement
│   ├── PaymentSuccess.jsx       # Page de succès paiement
│   ├── Navbar.jsx               # Barre de navigation
│   ├── Layout.jsx               # Layout principal
│   └── ProtectedRoute.jsx       # Route protégée
├── contexts/
│   └── AuthContext.jsx          # Contexte d'authentification
├── services/
│   └── api.js                   # Services API
├── assets/
│   └── react.svg                # Assets
├── App.jsx                      # Composant principal
├── main.jsx                     # Point d'entrée
├── App.css                      # Styles principaux
├── index.css                    # Styles globaux
└── theme.js                     # Configuration thème
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/forgot-password` - Demande de réinitialisation
- `POST /api/auth/reset-password` - Réinitialisation du mot de passe

### Casiers
- `GET /api/lockers` - Liste des casiers
- `POST /api/lockers` - Créer un casier (admin)
- `PUT /api/lockers/:id` - Modifier un casier (admin)
- `DELETE /api/lockers/:id` - Supprimer un casier (admin)

### Réservations
- `GET /api/reservations` - Liste des réservations
- `POST /api/reservations` - Créer une réservation
- `PUT /api/reservations/:id` - Modifier une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

### Paiement
- `POST /api/payment/create-checkout-session` - Créer session Stripe
- `POST /api/payment/webhook` - Webhook Stripe
- `POST /api/payment/confirm` - Confirmer le paiement

## Technologies Utilisées

### Backend
- Node.js avec Express
- MongoDB avec Mongoose
- JWT pour l'authentification
- Stripe pour les paiements
- Mailtrap pour les emails

### Frontend
- React avec Vite
- React Router pour la navigation
- Context API pour l'état global
- Axios pour les requêtes API
- Material UI

## Configuration Stripe

1. Créer un compte Stripe
2. Récupérer les clés API (publique et secrète)
3. Configurer les webhooks
4. Ajouter les variables d'environnement

### Configuration Webhook en Local

Pour tester les webhooks Stripe en local : (source CHATGPT)

1. **Installer Stripe CLI**
   ```bash
   # Sur macOS avec Homebrew
   brew install stripe/stripe-cli/stripe
    ```

2. **Se connecter à votre compte Stripe**
   ```bash
   stripe login
   ```

3. **Démarrer le forwarding des webhooks**
   ```bash
   # Remplacer 5000 par le port de votre backend
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```

4. **Récupérer le webhook secret**
    - Le CLI affiche un webhook secret (commence par `whsec_`)
    - Copier ce secret dans votre fichier `.env` :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```

5. **Tester les webhooks**
    - Les événements Stripe seront maintenant transmis à votre serveur local
    - Vous pouvez voir les logs dans le terminal où vous avez lancé `stripe listen`

**Note :** Le webhook secret change à chaque redémarrage du CLI. Pensez à le mettre à jour dans votre `.env`.




Projet développé pour projet à l'école dans la matière NodeJS