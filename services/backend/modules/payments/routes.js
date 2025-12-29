import { Router } from "express";
import Stripe from "stripe";

const router = Router();

const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripe_secret_key);

/**
 * POST /api/payments/checkout
 */
router.post("/checkout", async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: "Computer",
            },
            unit_amount: 50 * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:8080/admin-dashboard/payments/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:8080/admin-dashboard/payments/cancel",
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


export default router;