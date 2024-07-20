import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ price }) => {
    const currency = "USD";
    const backend = process.env.REACT_APP_FLASK_BACKEND_URL;

    const createOrder = async (data, actions) => {
        try {
            const response = await fetch(`${backend}create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ price })
            });
            const orderData = await response.json();

            if (orderData.approval_url) {
                window.location.href = orderData.approval_url;
            } else {
                console.error(orderData.error);
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: price,  
                        currency_code: currency  
                    }
                }]
            });
        } catch (error) {
            console.error('Error creating payment:', error);
        }
    };

    const paypal_client_id = process.env.REACT_APP_PAYPAL_CLIENT_ID;

    return (
        <PayPalScriptProvider options={{ "client-id": paypal_client_id, "currency": currency }}>
            <PayPalButtons
                createOrder={createOrder}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalButton;
