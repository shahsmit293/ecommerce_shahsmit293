import React, { useState, useContext, useRef, useEffect } from 'react';
import { Context } from '../store/appContext';

const Signup = () => {
    const { actions, store } = useContext(Context);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(''); // State for verification code
    const [error, setError] = useState('');
    const [showVerification, setShowVerification] = useState(false); // State to control popup/modal
    const [passwordCriteria, setPasswordCriteria] = useState({
        lowerCase: false,
        upperCase: false,
        number: false,
        minLength: false,
        specialChar: false,
        noLeadingTrailingSpace: false
    });
    const [isTyping, setIsTyping] = useState(false); // State to track if the user has started typing

    const passwordInputRef = useRef(null);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setIsTyping(true); // Set isTyping to true once the user starts typing

        setPasswordCriteria({
            lowerCase: /[a-z]/.test(value),
            upperCase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            minLength: value.length >= 8,
            specialChar: /[\W_]/.test(value) || /\s/.test(value),
            noLeadingTrailingSpace: /^\S.*\S$|^\S$/.test(value)
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await actions.signup(email, password);
            setShowVerification(true); // Show verification popup after signup
        } catch (err) {
            setError(store.error);
        }
    };

    const handleVerificationSubmit = async (event) => {
        event.preventDefault();
        try {
            await actions.confirmSignup(email, verificationCode);
            // Optionally, handle successful confirmation: redirect, show success message, etc.
        } catch (err) {
            setError(err.message);
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
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            ref={passwordInputRef}
                        />
                    </label>
                </div>
                {isTyping && ( // Only show the criteria list if the user has started typing
                    <div>
                        <ul>
                            <li style={{ color: passwordCriteria.lowerCase ? 'green' : 'red' }}>
                                {passwordCriteria.lowerCase ? '✓' : '✖'} Password must contain a lower case letter
                            </li>
                            <li style={{ color: passwordCriteria.upperCase ? 'green' : 'red' }}>
                                {passwordCriteria.upperCase ? '✓' : '✖'} Password must contain an upper case letter
                            </li>
                            <li style={{ color: passwordCriteria.number ? 'green' : 'red' }}>
                                {passwordCriteria.number ? '✓' : '✖'} Password must contain a number
                            </li>
                            <li style={{ color: passwordCriteria.minLength ? 'green' : 'red' }}>
                                {passwordCriteria.minLength ? '✓' : '✖'} Password must contain at least 8 characters
                            </li>
                            <li style={{ color: passwordCriteria.specialChar ? 'green' : 'red' }}>
                                {passwordCriteria.specialChar ? '✓' : '✖'} Password must contain a special character or a space
                            </li>
                            <li style={{ color: passwordCriteria.noLeadingTrailingSpace ? 'green' : 'red' }}>
                                {passwordCriteria.noLeadingTrailingSpace ? '✓' : '✖'} Password must not contain a leading or trailing space
                            </li>
                        </ul>
                    </div>
                )}
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit">Signup</button>
            </form>

            {/* Verification Popup */}
            {showVerification && (
                <div>
                    <h2>Verify Email</h2>
                    <form onSubmit={handleVerificationSubmit}>
                        <div>
                            <label>
                                Verification Code:
                                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                            </label>
                        </div>
                        <button type="submit">Verify</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Signup;
