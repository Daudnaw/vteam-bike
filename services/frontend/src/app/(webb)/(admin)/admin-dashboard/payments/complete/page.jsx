"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const BASE_URL = "http://localhost:3000";

function formatCurrency(amountInÖre, currency) {
  if (amountInÖre == null) return "-";
  const amount = amountInÖre / 100;
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: currency?.toUpperCase() ?? "SEK",
  }).format(amount);
}

export default function Page() {
    const params = useSearchParams();
    const sessionId = params.get("session_id");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);

    useEffect(() => {
    if (!sessionId) {
      setError("No session-id found in URL:en.");
      setLoading(false);
      return;
    }

    async function confirmCreditsOnce() {
        const key = `credits_confirmed_${sessionId}`;
        if (typeof window !== "undefined" && localStorage.getItem(key) === "1") {
        return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/payments/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sessionId }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "Could not confirm payment");
            }

            await res.json().catch(() => ({}));

            if (typeof window !== "undefined") {
                localStorage.setItem(key, "1");
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchSession() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/payments/checkout/${sessionId}`, {
            credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Could not get payments info");
        }

        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error(err);
        setError(err?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    (async () => {
      await confirmCreditsOnce();
      await fetchSession();
    })();
  }, [sessionId]);

  return (
    <div className="mt-10 flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
            <div>
            <h1 className="text-2xl font-semibold text-slate-900">
                Payment completed
            </h1>

            <p className="text-sm text-slate-500 mt-1">
                Thank you for your purchase. Here is a summary of your order.
            </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-emerald-600 text-xl">✓</span>
            </div>
        </div>

        {loading && (
            <p className="text-slate-500 text-sm">
            Loading payment details…
            </p>
        )}

        {error && !loading && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            </div>
        )}

        {!loading && !error && session && (
            <>
            <div className="mb-6 space-y-1">
                <p className="text-sm text-slate-500">
                Order ID
                </p>

                <p className="text-sm font-mono text-slate-800 break-all">
                {session.id}
                </p>

                {session.customer_email && (
                <p className="text-sm text-slate-500 mt-3">
                    A receipt will be sent to{" "}
                    <span className="font-medium text-slate-800">
                    {session.customer_email}
                    </span>
                </p>
                )}

                <p className="mt-1 text-sm">
                Status:{" "}
                <span
                    className={
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (session.payment_status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700")
                    }
                >
                    {session.payment_status === "paid"
                    ? "Paid"
                    : session.payment_status}
                </span>
                </p>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                Your items
                </h2>

                <div className="space-y-3">
                {session.line_items?.map((item) => (
                    <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                    >
                    <div>
                        <p className="font-medium text-slate-900">
                        {item.description}
                        </p>

                        <p className="text-slate-500 text-xs">
                        Quantity: {item.quantity}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-medium text-slate-900">
                        {formatCurrency(item.amount_total, session.currency)}
                        </p>

                        {item.amount_subtotal !== item.amount_total && (
                        <p className="text-xs text-slate-400 line-through">
                            {formatCurrency(
                            item.amount_subtotal,
                            session.currency
                            )}
                        </p>
                        )}
                    </div>
                    </div>
                ))}
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-800">
                    Total
                </p>

                <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(session.amount_total, session.currency)}
                </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <a
                href="/admin-dashboard"
                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                Back to dashboard
                </a>
            </div>
            </>
        )}
        </div>
    </div>
    );
}