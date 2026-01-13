"use client";

const BASE_URL = "http://localhost:3000";

export default async function checkOut(amountInSek) {
    try {
        const res = await fetch(`${BASE_URL}/api/payments/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: amountInSek }),
        });

    if (!res.ok) {
        console.error("Failed to create checkout session", res.status);
        alert("Could not start payment");
        return;
    }

    const { url } = await res.json();

    if (!url) {
        alert("No Stripe URL returned from server");
        return;
    }

    window.location.href = url;
    } catch (err) {
        console.error("Unexpected error in checkOut:", err);
        alert("Unexpected error during payment");
    }
}