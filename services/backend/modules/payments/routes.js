import { Router } from "express";
import Stripe from "stripe";
import { requireAuth, requireAdmin, issueAuthCookie } from "../auth/middleware.js";
import User from "../users/model.js";
import PaymentEvent from "./model.js";

const router = Router();

const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripe_secret_key);

router.post("/checkout", requireAuth, async (req, res, next) => {
  const MEMBERSHIPS = {
    small:  { amount: 100, name: "Small membership" },
    medium: { amount: 300, name: "Medium membership" },
    allin:  { amount: 700, name: "All in membership" },
  };

  try {
    const { mode, amount, tier } = req.body;

    if (mode !== "payment" && mode !== "subscription") {
      return res.status(400).json({ error: "Invalid mode" });
    }

    let line_items;

    if (mode === "payment") {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt < 10 || amt > 5000) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      line_items = [
        {
          price_data: {
            currency: "sek",
            product_data: { name: `Credit pot ${amt} kr` },
            unit_amount: Math.round(amt * 100),
          },
          quantity: 1,
        },
      ];
    }

    if (mode === "subscription") {
      const membership = MEMBERSHIPS[tier];
      if (!membership) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      line_items = [
        {
          price_data: {
            currency: "sek",
            product_data: { name: membership.name },
            unit_amount: membership.amount * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];
    }

    const userId = req.user?.sub ?? req.user?.id;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items,
    success_url: `http://localhost:8080/user-dashboard/payments/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:8080/user-dashboard/payments`,
    client_reference_id: userId,
    metadata: { userId, type: mode === "payment" ? "credits" : "membership", tier: tier ?? "" },
  });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/confirm", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const already = await PaymentEvent.findOne({ stripeSessionId: session.id });
    if (already) return res.json({ ok: true, alreadyProcessed: true });

    const userId = req.user.sub;

    if (session.mode === "payment") {
      const amountSek = (session.amount_total ?? 0) / 100;

      await User.findByIdAndUpdate(userId, { $inc: { credit: amountSek } });

      await PaymentEvent.create({
        stripeSessionId: session.id,
        userId,
        type: "credits",
        amountSek,
        currency: session.currency ?? "sek",
      });

      return res.json({ ok: true, creditAdded: amountSek });
    }

    if (session.mode === "subscription") {
      const tier = session.metadata?.tier || "";
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!tier || !subscriptionId) {
        return res.status(400).json({ error: "Missing tier/subscriptionId" });
      }

      const sub = await stripe.subscriptions.retrieve(subscriptionId);

      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      await User.findByIdAndUpdate(userId, {
        $set: {
          "membership.tier": tier,
          "membership.status": sub.status ?? "active",
          "membership.stripeSubscriptionId": subscriptionId,
          "membership.currentPeriodEnd": periodEnd,
        },
      });

      const amountSek = (session.amount_total ?? 0) / 100;

      await PaymentEvent.create({
        stripeSessionId: session.id,
        userId,
        type: "membership",
        tier,
        amountSek,
        currency: session.currency ?? "sek",
      });

      const updated = await User.findById(userId);
      issueAuthCookie(res, updated);

      return res.json({
        ok: true,
        membershipActivated: true,
        tier,
        status: sub.status,
        currentPeriodEnd: periodEnd,
      });
    }

    return res.status(400).json({ error: "Unknown session mode" });
  } catch (err) {
    console.error("confirm failed:", err);
    return res.status(500).json({ error: "Confirm failed" });
  }
});

router.get("/checkout/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["line_items", "payment_intent", "customer_details"],
    });

    const lineItems = session.line_items?.data ?? [];

    const payload = {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email ?? null,
      created: session.created,
      line_items: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        amount_subtotal: item.amount_subtotal,
        amount_total: item.amount_total,
      })),
    };

    return res.json(payload);
  } catch (err) {
    console.error("Failed to fetch Stripe session:", err);
    return res
      .status(400)
      .json({ message: "Kunde inte hämta betalningsinformationen" });
  }
});

router.get("/stats/net-volume", async (req, res) => {
  try {
    let { from, to } = req.query;

    const now = Math.floor(Date.now() / 1000);
    const thirtyDays = 30 * 24 * 60 * 60;

    const created = {
      gte: from ? Math.floor(new Date(from).getTime() / 1000) : now - thirtyDays,
      lte: to ? Math.floor(new Date(to).getTime() / 1000) : now,
    };

    const txns = await stripe.balanceTransactions.list({
      limit: 100,
      created,
    });

    const byDay = {};

    for (const t of txns.data) {
      const date = new Date(t.created * 1000)
        .toISOString()
        .slice(0, 10);

      if (!byDay[date]) {
        byDay[date] = {
          gross: 0,
          fee: 0,
          net: 0,
          count: 0,
        };
      }

      byDay[date].gross += t.amount;
      byDay[date].fee += t.fee;
      byDay[date].net += t.net;
      byDay[date].count += 1;
    }

    const result = Object.entries(byDay)
      .sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))
      .map(([date, vals]) => ({
        date,
        gross: vals.gross / 100,
        fee: vals.fee / 100,
        net: vals.net / 100,
        count: vals.count,
      }));

    return res.json({
      from: created.gte,
      to: created.lte,
      currency: "SEK",
      days: result,
    });
  } catch (err) {
    console.error("Failed to fetch net volume stats:", err);
    return res
      .status(500)
      .json({ message: "Could not fetch net volume stats" });
  }
});

export default router;