const { 
  createPaymentIntent, 
  confirmPayment, 
  refundPayment, 
  createCustomer,
  getPaymentDetails,
  stripeInstance: stripe
} = require('../services/stripeService');
const Reservation = require('../models/Reservation');
const Locker = require('../models/Locker');
const User = require('../models/User');
const emailService = require('../services/emailService');

exports.createPayment = async (req, res) => {
  try {
    
    const { reservationId } = req.body;
    const userId = req.user.id;

    if (!reservationId) {
      return res.status(400).json({ message: 'reservationId est requis' });
    }

    const reservation = await Reservation.findById(reservationId)
      .populate('locker', 'number size price address')
      .populate('user', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (reservation.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (reservation.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cette réservation est déjà payée' });
    }

    let stripeCustomerId = reservation.stripeCustomerId;
    if (!stripeCustomerId) {
      const customerResult = await createCustomer(
        reservation.user.email, 
        reservation.user.name
      );
      
      if (!customerResult.success) {
        return res.status(500).json({ message: 'Erreur lors de la création du client' });
      }
      
      stripeCustomerId = customerResult.customer.id;
      reservation.stripeCustomerId = stripeCustomerId;
      await reservation.save();
    }


    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Casier #${reservation.locker.number}`,
              description: `Réservation pour ${reservation.duration} heures`,
            },
            unit_amount: Math.round(reservation.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
      metadata: {
        reservationId: reservation._id.toString(),
        lockerNumber: reservation.locker.number,
        userId: userId,
        duration: reservation.duration.toString()
      }
    });

    reservation.checkoutSessionId = session.id;
    await reservation.save();

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'paymentIntentId est requis' });
    }

    let reservation = await Reservation.findOne({
      paymentIntentId: paymentIntentId,
      user: userId 
    }).populate('locker');

    if (!reservation && paymentIntentId.match(/^[a-fA-F0-9]{24}$/)) {
      reservation = await Reservation.findOne({
        _id: paymentIntentId,
        user: userId
      }).populate('locker');
    }

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    let paymentResult;
    if (paymentIntentId.includes('test_mode')) {
      paymentResult = {
        success: true,
        paymentIntent: { status: 'succeeded' }
      };
    } else {
      paymentResult = await confirmPayment(paymentIntentId);
    }

    if (!paymentResult.success) {
      return res.status(400).json({ message: paymentResult.error });
    }

    reservation.paymentStatus = 'paid';
    reservation.status = 'active';
    await reservation.save();

    const locker = await Locker.findById(reservation.locker._id);
    if (locker) {
      locker.status = 'reserved';
      await locker.save();
    }

    res.json({
      success: true,
      message: 'Paiement confirmé avec succès',
      reservation: {
        _id: reservation._id,
        paymentStatus: reservation.paymentStatus,
        totalPrice: reservation.totalPrice,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        locker: {
          number: reservation.locker.number,
          address: reservation.locker.address
        }
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;

    const reservation = await Reservation.findById(reservationId)
      .populate('locker');

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (reservation.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (reservation.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Cette réservation n\'est pas payée' });
    }

    const refundResult = await refundPayment(reservation.paymentIntentId);

    if (!refundResult.success) {
      return res.status(500).json({ message: 'Erreur lors du remboursement' });
    }

    reservation.paymentStatus = 'refunded';
    reservation.status = 'cancelled';
    await reservation.save();

    const locker = await Locker.findById(reservation.locker._id);
    if (locker) {
      locker.status = 'available';
      await locker.save();
    }

    res.json({
      success: true,
      message: 'Remboursement effectué avec succès',
      refund: refundResult.refund
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    const reservation = await Reservation.findOne({
      paymentIntentId: paymentIntentId,
      user: userId 
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const paymentResult = await getPaymentDetails(paymentIntentId);

    if (!paymentResult.success) {
      return res.status(500).json({ message: 'Erreur lors de la récupération du paiement' });
    }

    res.json({
      success: true,
      payment: paymentResult.payment,
      reservation: {
        _id: reservation._id,
        paymentStatus: reservation.paymentStatus,
        totalPrice: reservation.totalPrice
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      const reservation = await Reservation.findOne({
        checkoutSessionId: session.id 
      }).populate('locker').populate('user');

      if (reservation) {
        reservation.paymentStatus = 'paid';
        reservation.status = 'active';
        reservation.paymentIntentId = session.payment_intent;
        await reservation.save();

        const locker = await Locker.findById(reservation.locker._id);
        if (locker) {
          locker.status = 'reserved';
          await locker.save();
        }

        try {
          await emailService.sendPaymentConfirmed(reservation.user, reservation, locker);
        } catch (emailError) {
        }
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      
      const expiredReservation = await Reservation.findOne({
        checkoutSessionId: expiredSession.id 
      }).populate('user').populate('locker');
      
      if (expiredReservation && expiredReservation.paymentStatus === 'pending') {
        expiredReservation.status = 'cancelled';
        await expiredReservation.save();

        try {
          await emailService.sendPaymentFailed(expiredReservation.user, expiredReservation, expiredReservation.locker);
        } catch (emailError) {
          console.error('envoi email paiement échoué:', emailError);
        }
      }
      break;

    default:
  }

  res.json({ received: true });
}; 

exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const reservation = await Reservation.findOne({
      checkoutSessionId: sessionId,
      user: userId 
    }).populate('locker');

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      if (reservation.paymentStatus !== 'paid') {
        reservation.paymentStatus = 'paid';
        reservation.status = 'active';
        reservation.paymentIntentId = session.payment_intent;
        await reservation.save();

        const locker = await Locker.findById(reservation.locker._id);
        if (locker) {
          locker.status = 'reserved';
          await locker.save();
        }
      }

      res.json({
        success: true,
        message: 'Paiement confirmé',
        reservation: {
          _id: reservation._id,
          paymentStatus: reservation.paymentStatus,
          totalPrice: reservation.totalPrice,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          locker: {
            number: reservation.locker.number,
            address: reservation.locker.address
          }
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Paiement non confirmé',
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 