"use client";
import React from "react";
import checkOut from "../../../../../../components/payments/PaymentHelpers";

export default function Page() {
    return (
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
                onClick={() => checkOut(100)}
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
                onClick={() => checkOut(300)}
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
                onClick={() => checkOut(500)}
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
    );
}