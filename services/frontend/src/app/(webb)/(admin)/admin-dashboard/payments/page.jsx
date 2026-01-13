"use client";
import React from "react";
import { useState } from "react";
import checkOut from "../../../../../../components/payments/PaymentHelpers";

export default function Page() {
    const [minutes, setMinutes] = useState(0);
    const [amount, setAmount] = useState(0);

    function handleMinutesChange(e) {
        const value = Number(e.target.value);

        setMinutes(value);


        setAmount(value * 3 + 10);
    }

    return (
        <div>
            <div className="mt-10 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
                <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Buy credits
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Choose a credit pot to top up your account.
                </p>
                </div>

                <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => checkOut({ mode: "payment", amount: 100 })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">Small pot</p>
                    <p className="text-xs text-slate-500">Perfect for testing</p>
                    </div>
                    <span className="font-semibold text-slate-900">100 kr</span>
                </button>

                <button
                    type="button"
                    onClick={() => checkOut({ mode: "payment", amount: 300 })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">Medium pot</p>
                    <p className="text-xs text-slate-500">For regular use</p>
                    </div>
                    <span className="font-semibold text-slate-900">300 kr</span>
                </button>

                <button
                    type="button"
                    onClick={() => checkOut({ mode: "payment", amount: 500 })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">Large pot</p>
                    <p className="text-xs text-slate-500">Best value</p>
                    </div>
                    <span className="font-semibold text-slate-900">500 kr</span>
                </button>
                </div>
            </div>
        </div>


        <div className="mt-10 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
                <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Buy membership
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Choose a membership to your account.
                </p>
                </div>

                <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => checkOut({ mode: "subscription", tier: "small" })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">Small membership</p>
                    <p className="text-xs text-slate-500">Get 25% off the ride</p>
                    </div>
                    <span className="font-semibold text-slate-900">100 kr/month</span>
                </button>

                <button
                    type="button"
                    onClick={() => checkOut({ mode: "subscription", tier: "medium" })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">Medium membership</p>
                    <p className="text-xs text-slate-500">Get 50% off the trip</p>
                    </div>
                    <span className="font-semibold text-slate-900">300 kr/month</span>
                </button>

                <button
                    type="button"
                    onClick={() => checkOut({ mode: "subscription", tier: "allin" })}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium text-slate-900">All in</p>
                    <p className="text-xs text-slate-500">Get all rides for free</p>
                    </div>
                    <span className="font-semibold text-slate-900">700 kr/month</span>
                </button>
                </div>
            </div>
        </div>
        
        <div className="mt-10 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
                <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Simulate a ride for {minutes || 0} minutes
                </h1>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <p className="font-medium text-slate-900">Minutes</p>
                        <input
                            type="number"
                            min={0}
                            value={minutes}
                            onChange={handleMinutesChange}
                            className="border rounded-xl px-2 py-1 w-20"
                        />
                    </div>
                    <p className="font-light text-slate-900">Price: {minutes} * 3 + 10 = <b>{amount} kr</b> (Formula from Voi)</p>
                <button
                    type="button"
                    onClick={() => checkOut(amount)}
                    className="w-full flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                >
                    Pay {amount} kr
                </button>
                </div>
            </div>
        </div>
    </div>
    );
}