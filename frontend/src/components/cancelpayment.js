import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CancelPayment = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Show message for 3 seconds
        const timer = setTimeout(() => {
            // Redirect to home page
            navigate('/');
        }, 3000); // 3000 milliseconds = 3 seconds

        // Cleanup timer if the component is unmounted before timeout
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div>
            <h1>Payment Cancelled. Now Redirecting to home page.................</h1>
        </div>
    );
};

export default CancelPayment;
