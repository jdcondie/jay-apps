import { Request, Response, NextFunction } from 'express';

const PLAN_LIMITS = {
  free:   { pipelines_per_month: 5,  scans_per_month: 10 },
  pro:    { pipelines_per_month: 50, scans_per_month: 100 },
  agency: { pipelines_per_month: -1, scans_per_month: -1 },
};

export async function billingMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith('/pipeline') && !req.path.startsWith('/scanner')) {
    return next();
  }

  const supabase = (req as any).supabase;
  const user = (req as any).user;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single();

  const plan = sub?.plan || 'free';
  (req as any).plan = plan;

  if (plan === 'agency') return next();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const eventType = req.path.startsWith('/pipeline') ? 'blueprint' : 'scan';

  const { count } = await supabase
    .from('usage_events')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('event_type', eventType)
    .gte('created_at', startOfMonth.toISOString());

  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  const cap = req.path.startsWith('/pipeline') ? limit.pipelines_per_month : limit.scans_per_month;

  if (cap !== -1 && (count || 0) >= cap) {
    return res.status(402).json({
      error: 'limit_reached',
      message: `You've reached your ${plan} plan limit. Upgrade to continue.`,
      plan,
    });
  }

  next();
}
