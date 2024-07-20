import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const [status, setStatus] = useState('');
    const [price, setPrice] = useState(null);
    const [paymentId, setPaymentId] = useState('');
    const [payerId, setPayerId] = useState('');
    const backend = process.env.REACT_APP_FLASK_BACKEND_URL;

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const paymentId = queryParams.get('paymentId');
        const payerId = queryParams.get('PayerID');

        console.log('Payment ID:', paymentId);
        console.log('Payer ID:', payerId);

        if (paymentId && payerId) {
            setPaymentId(paymentId);
            setPayerId(payerId);

            fetch(`${backend}get-payment-details?paymentId=${paymentId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Payment Details:', data);
                    setPrice(data.price);  // Assuming your backend returns price
                })
                .catch(error => {
                    console.error('Error:', error);
                    setStatus('Failed to fetch payment details.');
                });
        } else {
            setStatus('Missing payment information.');
        }
    }, [backend]);

    const handleExecutePayment = () => {
        fetch(`${backend}payment-success`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId, payerId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Payment successful') {
                setStatus('Payment successful!');
                navigate('/') // Redirect to success page
            } else {
                setStatus('Payment failed.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setStatus('Payment failed.');
        });
    };

    return (
        <div>
            <h1>{status}</h1>
            {price !== null && <p>Price: ${price}</p>}
            <button onClick={handleExecutePayment}>Confirm Payment</button>
            <button onClick={()=>navigate("/paymentcancel")}>Cancel Payment</button>
        </div>
    );
};

export default PaymentSuccess;
