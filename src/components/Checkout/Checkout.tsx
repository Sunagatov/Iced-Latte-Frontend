'use client'

import React, {useCallback} from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {api} from "@/services/apiConfig/apiConfig";
import {useAuthStore} from "@/store/authStore";
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test public API key.
// FIXME: extract to .env
const stripePromise = loadStripe("pk_test_51PJxciHA4AopuQMMYzVC8YDA7nvEmf5PMe5T7HcBfPeuuPspMlc9WmwKLYn0LVF2mE4VJVV9j87tS8IWVXQn8aCa00VLopad8w");

interface PaymentSession {
    clientSecret: string;
}

export default function CheckoutForm() {
    const { token } = useAuthStore();
    const fetchClientSecret = useCallback(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        // Create a Checkout Session
        return api.get("/payment", config)
            .then((res): PaymentSession => res.data)
            .then((data: PaymentSession): string => data.clientSecret);
    }, [token]);
    const options = {fetchClientSecret};
    return (
        <>
            <div id="checkout">
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}
                >
                    <EmbeddedCheckout/>
                </EmbeddedCheckoutProvider>
            </div>
        </>
    )
}
