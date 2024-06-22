import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [loginError, setLoginError] = useState(null); // State for login error

    const handleSubmit = async (e) => {
        e.preventDefault();
        await actions.login(username, password);
        if (store.error) {
            // Store the error message
            setLoginError(store.error);
            // Reload the page on error
            window.location.reload();
        } else {
            // Clear error and navigate upon successful login
            setLoginError(null);
            navigate('/');
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        await actions.forgotPassword(email);
        setShowForgotPassword(false);
        setShowResetPassword(true);
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setPasswordMatchError('Passwords do not match');
            return;
        }
        await actions.confirmForgotPassword(email, verificationCode, newPassword);
        setShowResetPassword(false);
    };

    const handleInputChange = () => {
        // Clear login error message on input change
        setLoginError(null);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); handleInputChange(); }} />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); handleInputChange(); }} />
                </label>
                <button type="submit">Login</button>
            </form>
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>} {/* Display login error */}
            <button onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>

            {showForgotPassword && (
                <div>
                    <h2>Forgot Password</h2>
                    <form onSubmit={handleForgotPasswordSubmit}>
                        <label>
                            Email:
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </label>
                        <button type="submit">Send Verification Code</button>
                    </form>
                </div>
            )}

            {showResetPassword && (
                <div>
                    <h2>Reset Password</h2>
                    <form onSubmit={handleResetPasswordSubmit}>
                        <label>
                            Verification Code:
                            <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                        </label>
                        <label>
                            New Password:
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </label>
                        <label>
                            Confirm New Password:
                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                        </label>
                        {passwordMatchError && <p style={{ color: 'red' }}>{passwordMatchError}</p>}
                        <button type="submit">Reset Password</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Login;
