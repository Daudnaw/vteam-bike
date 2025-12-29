import { Router } from "express";
import Stripe from "stripe";

const router = Router();

const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripe_secret_key);


router.post("/checkout", async (req, res, next) => {
  try {
    const { amount } = req.body;

    const allowedAmounts = [100, 300, 500];
    const selectedAmount = allowedAmounts.includes(amount) ? amount : 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: `Credit pot ${selectedAmount} kr`,
            },
            unit_amount: selectedAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:8080/admin-dashboard/payments/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:8080/admin-dashboard/payments",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return next(err);
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