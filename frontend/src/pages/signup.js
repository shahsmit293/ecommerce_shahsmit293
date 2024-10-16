import React, { useState, useContext, useRef, useEffect } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [showSuccessSpinner, setShowSuccessSpinner] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [showResendModal, setShowResendModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        lowerCase: false,
        upperCase: false,
        number: false,
        minLength: false,
        specialChar: false,
        noLeadingTrailingSpace: false
    });
    const [isTyping, setIsTyping] = useState(false);

    const first_name = store.firstname
    const last_name = store.lastname
    const phone_number = store.phonenumber
    
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

    const handleFirstnameChange = (e) => {
        const value = e.target.value;
        setFirstname(value);
        setError('');
    };

    const handleLastnameChange = (e) => {
        const value = e.target.value;
        setLastname(value);
        setError('');
    };

    const handlePhonenumberChange = (e) => {
        const value = e.target.value;
        setPhonenumber(value);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors
        try {
            const result = await actions.signup(email, password, firstname, lastname, '+1' + phonenumber);
            if (result === true) {
                setShowVerifyModal(true); // Show verification modal if signup is successful
            } else if (result === 'unverified') {
                setShowResendModal(true);  // Show resend verification code modal
            } else {
                setError(result); // Display error message if signup failed
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.'); // Fallback error message
        }
    };

    
    const handleResendVerificationCode = async () => {
        try {
            await actions.resendVerificationCode(email); // Resend verification code
            setShowResendModal(false); // Close Resend Modal
            setShowVerifyModal(true); // Show Verify Modal
        } catch (err) {
            setError('Failed to resend verification code. Please try again.');
        }
    };

    const handleVerificationSubmit = async (event) => {
        event.preventDefault();
        setVerificationError(''); // Clear previous verification error
        try {

            const firstnameToUse = first_name || firstname;
            const lastnameToUse = last_name || lastname;
            const phonenumberToUse = phone_number || phonenumber;

            const result = await actions.confirmSignup(email, verificationCode,firstnameToUse, lastnameToUse, phonenumberToUse);
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
                                    type="text"
                                    placeholder="First Name"
                                    value={firstname}
                                    onChange={handleFirstnameChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastname}
                                    onChange={handleLastnameChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="number"
                                    placeholder="Contact Number"
                                    value={phonenumber}
                                    onChange={handlePhonenumberChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={handlePasswordChange}
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
                            {error && <div className="error-message">{error}</div>}
                            <button type="submit" className="signup-button">Sign Up</button>
                            {showResendButton && (
                            <div className="resend-verification">
                                <button onClick={handleResendVerificationCode} className="resend-btn">Resend Verification Code</button>
                            </div>
                        )}
                        </form>
                        <div className="login-text">
                            Already have an account? 
                            <button onClick={() => navigate('/login')} className="login-btn">Login</button>
                        </div>
                    </div>

                {/* Resend Verification Modal */}
                {showResendModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Account Exists</h5>
                                    <button type="button" className="close" onClick={() => {setShowResendModal(false);window.location.reload();}}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p style={{ color: 'orange', fontWeight: 'bold' }}>
                                        You already have an account with us but need to verify your email to complete registration.
                                    </p>
                                    <button onClick={handleResendVerificationCode} className="resend-btn">
                                        Resend Verification Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enter Verification Code Modal */}
                {showVerifyModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Verify Email</h5>
                                    <button type="button" className="close" onClick={() => {setShowVerifyModal(false);window.location.reload();}}>
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
