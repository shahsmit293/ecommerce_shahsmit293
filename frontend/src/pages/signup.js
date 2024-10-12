import React, { useState, useContext, useRef, useEffect } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { actions } = useContext(Context);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState(''); // State to handle signup errors
    const [verificationError, setVerificationError] = useState(''); // For verification errors
    const [showVerification, setShowVerification] = useState(false);
    const [showSuccessSpinner, setShowSuccessSpinner] = useState(false); // For showing spinner after verification
    const [passwordCriteria, setPasswordCriteria] = useState({
        lowerCase: false,
        upperCase: false,
        number: false,
        minLength: false,
        specialChar: false,
        noLeadingTrailingSpace: false
    });
    const [isTyping, setIsTyping] = useState(false);

    const passwordInputRef = useRef(null);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setIsTyping(true);
        setError('');

        setPasswordCriteria({
            lowerCase: /[a-z]/.test(value),
            upperCase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            minLength: value.length >= 8,
            specialChar: /[\W_]/.test(value),
            noLeadingTrailingSpace: /^\S.*\S$|^\S$/.test(value)
        });
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors
        try {
            const result = await actions.signup(email, password);
            if (result === true) {
                setShowVerification(true); // Show verification modal if signup is successful
            } else {
                setError(result); // Display error message if signup failed
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.'); // Fallback error message
        }
    };

    const handleVerificationSubmit = async (event) => {
        event.preventDefault();
        setVerificationError(''); // Clear previous verification error
        try {
            const result = await actions.confirmSignup(email, verificationCode);
            if (result === true) {
                // Show success message and spinner
                setShowSuccessSpinner(true);
                setTimeout(() => {
                    // After 2 seconds, navigate to login page
                    navigate('/login');
                }, 2000);
            } else {
                setVerificationError(result); // Show the error if the verification code is incorrect
            }
        } catch (err) {
            setVerificationError('An unexpected error occurred. Please try again.');
        }
    };

    const handleClickOutside = (event) => {
        if (passwordInputRef.current && !passwordInputRef.current.contains(event.target)) {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="signup-container">
            <div className="signup-left">
                <img src="https://staticloginsignuppage.s3.amazonaws.com/loginsignupimage.jpg" alt="Phone Illustration" className="signup-image" />
            </div>
            <div className="signup-right">
                <div className="form-container">
                    <h1>Join Us!</h1>
                    <p>Create your account</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={handleEmailChange} // Clear error on typing in email field
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange} // Clear error on typing in password field
                                required
                                ref={passwordInputRef}
                            />
                        </div>
                        {isTyping && (
                            <div className="password-criteria">
                                <ul>
                                    <li style={{ color: passwordCriteria.lowerCase ? 'green' : 'red' }}>
                                        {passwordCriteria.lowerCase ? '✓' : '✖'} Lower case letter
                                    </li>
                                    <li style={{ color: passwordCriteria.upperCase ? 'green' : 'red' }}>
                                        {passwordCriteria.upperCase ? '✓' : '✖'} Upper case letter
                                    </li>
                                    <li style={{ color: passwordCriteria.number ? 'green' : 'red' }}>
                                        {passwordCriteria.number ? '✓' : '✖'} Number
                                    </li>
                                    <li style={{ color: passwordCriteria.minLength ? 'green' : 'red' }}>
                                        {passwordCriteria.minLength ? '✓' : '✖'} At least 8 characters
                                    </li>
                                    <li style={{ color: passwordCriteria.specialChar ? 'green' : 'red' }}>
                                        {passwordCriteria.specialChar ? '✓' : '✖'} Special character or space
                                    </li>
                                    <li style={{ color: passwordCriteria.noLeadingTrailingSpace ? 'green' : 'red' }}>
                                        {passwordCriteria.noLeadingTrailingSpace ? '✓' : '✖'} No leading/trailing space
                                    </li>
                                </ul>
                            </div>
                        )}
                        {error && <div className="error-message">{error}</div>} {/* Display error message here */}
                        <button type="submit" className="signup-button">Sign Up</button>
                    </form>
                    <div className="login-text">
                        Already have an account? 
                        <button onClick={() => navigate('/login')} className="login-btn">Login</button>
                    </div>
                </div>

                {/* Verification Modal */}
                {showVerification && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Verify Email</h5>
                                    <button type="button" className="close" onClick={() => setShowVerification(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleVerificationSubmit}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                placeholder="Verification Code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="verify-btn">Verify</button>
                                        {verificationError && <p style={{ color: 'red' }}>{verificationError}</p>}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Spinner Section */}
                {showSuccessSpinner && (
                    <div className="success-spinner">
                        <div className="spinner"></div>
                        <p>Successfully registered! Redirecting...</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Signup;
