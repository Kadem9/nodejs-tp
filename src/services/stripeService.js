const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey === 'IASOAISAOI') {
}


const stripe = require('stripe')(stripeKey);

exports.createPaymentIntent = async (amount, currency = 'eur', metadata = {}) => {
  try {

    if (!amount || amount <= 0) {
      return {
        success: false,
        error: 'Montant invalide'
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

exports.confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntent: paymentIntent
      };
    } else {
      return {
        success: false,
        error: `Paiement non réussi: ${paymentIntent.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

exports.refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      success: true,
      refund: refund
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

exports.createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });

    return {
      success: true,
      customer: customer
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

exports.getPaymentDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      payment: paymentIntent
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 

exports.stripeInstance = stripe;