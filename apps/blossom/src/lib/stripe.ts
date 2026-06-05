import Stripe from "stripe";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export const stripe = getStripeClient();
