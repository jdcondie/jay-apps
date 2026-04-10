import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const PRICES: Record<string, string> = {
  pro:    process.env.STRIPE_PRICE_PRO!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
};

// POST /api/billing/checkout  (protected)
router.post('/checkout', authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { plan } = req.body;

  if (!PRICES[plan]) {
    return res.status(400).json({ error: 'invalid plan' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      success_url: `${process.env.WEB_URL}/dashboard?upgraded=true`,
      cancel_url:  `${process.env.WEB_URL}/dashboard`,
      metadata: { user_id: user.id },
      client_reference_id: user.id,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/billing/portal  (protected)
router.post('/portal', authMiddleware, async (req, res) => {
  const user = (req as any).user;

  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return res.status(400).json({ error: 'no subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: `${process.env.WEB_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/billing/webhook  (raw body, no auth)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e) {
    return res.status(400).send('Webhook signature verification failed');
  }

  const obj = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const userId = obj.metadata?.user_id || obj.client_reference_id;
    const sub = await stripe.subscriptions.retrieve(obj.subscription);
    const priceId = sub.items.data[0].price.id;
    const plan = priceId === PRICES.agency ? 'agency' : 'pro';

    await supabase.from('subscriptions').upsert({
      user_id:             userId,
      stripe_customer_id:  obj.customer,
      stripe_sub_id:       obj.subscription,
      plan,
      status:              'active',
      current_period_end:  new Date(sub.current_period_end * 1000).toISOString(),
    }, { onConflict: 'user_id' });
  }

  if (event.type === 'customer.subscription.updated') {
    const priceId = obj.items.data[0].price.id;
    const plan = priceId === PRICES.agency ? 'agency' : 'pro';
    await supabase.from('subscriptions')
      .update({
        plan,
        status:             obj.status,
        current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_sub_id', obj.id);
  }

  if (event.type === 'customer.subscription.deleted') {
    await supabase.from('subscriptions')
      .update({ plan: 'free', status: 'cancelled' })
      .eq('stripe_sub_id', obj.id);
  }

  res.json({ received: true });
});

export default router;
