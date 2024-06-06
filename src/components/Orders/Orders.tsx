'use client'

import React, {useEffect, useState} from "react";
import {api} from "@/services/apiConfig/apiConfig";
import {redirect} from "next/navigation";
import {useAuthStore} from "@/store/authStore";
import {useCombinedStore} from "@/store/store";
import Image from 'next/image'
import order from '../../../public/orders_stub.png'
import Button from "@/components/UI/Buttons/Button/Button";
import Link from "next/link";

interface PaymentSessionStatus {
    status: string;
    customerEmail: string;
}
export default function OrdersForm() {
    const [status, setStatus] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const {token} = useAuthStore();
    const resetCart = useCombinedStore((state) => state.resetCart);
    const syncBackendCart = useCombinedStore((state) => state.syncBackendCart)

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('sessionId');
        const config = {
            headers: {Authorization: `Bearer ${token}`}
        };
        api.get(`/payment/stripe/session-status?sessionID=${sessionId}`, config)
            .then((res): PaymentSessionStatus => res.data)
            .then((data: PaymentSessionStatus): void => {
                setStatus(data.status);
                setCustomerEmail(data.customerEmail);
            })
            .catch(err => console.error(err));
    }, [token, resetCart, syncBackendCart]);

    if (status === 'open') {
        return (
            redirect("/checkout")
        )
    }

    if (status === 'complete') {
        return (
            <section id="success">
                <p
                    className="flex items-center justify-center">
                    A confirmation email will be sent to {customerEmail}.
                </p>
                <p className="flex items-center justify-center">
                    If you have any questions, please email </p>
                <p className="flex items-center justify-center"><a
                    href="mailto:orders@iced-latte.com">orders@iced-latte.com</a>.</p>
                <div className=" mt-12 flex flex-col items-center gap-6 py-4">
                    <Image
                        className="flex w-50 h-30 justify-center"
                        src={order}
                        alt="Picture of order"
                        width={500}
                        height={500}
                    />
                    <Button
                        id="continue-btn"
                        className="h-14 w-[211px] text-lg font-medium"
                    >
                        <Link href={'/'}>Continue Shopping</Link>
                    </Button>
                </div>
            </section>
        )
    }
}
