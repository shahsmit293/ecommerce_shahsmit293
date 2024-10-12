import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const location = useLocation();
    const [useremail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [loading, setLoading] = useState(false); // For spinner/loader
    const [forgotPasswordError, setForgotPasswordError] = useState(null); // Error for forgot password
    const [resetPasswordError, setResetPasswordError] = useState(null); // Error for reset password
    const [successMessage, setSuccessMessage] = useState(''); // Success message for actions
    const [showSuccessSpinner, setShowSuccessSpinner] = useState(false); // Spinner for successful password reset

    const redirectTo = location.state?.from || '/';

    // Handle login logic
    const handleLogin = async () => {
        setLoading(true); // Start loading spinner
        setLoginError(null); // Clear previous errors

        try {
            await actions.login(useremail, password);
            setLoading(false); // Stop spinner
            navigate(redirectTo); // Navigate on success
        } catch (err) {
            setLoading(false); // Stop spinner
            setLoginError(err.message || 'Login failed. Please try again.');
        }
    };

    // Handle forgot password logic (sending verification code)
    const handleForgotPassword = async () => {
        setForgotPasswordError(null); // Clear previous errors
        setSuccessMessage('');
        setLoading(true); // Show loading spinner
        try {
            const result = await actions.forgotPassword(email);
            
            if (result.error) {
                throw new Error(result.error); // Handle backend error if present
            }

            setLoading(false); // Stop loading spinner
            setShowForgotPassword(false);
            setShowResetPassword(true); // Show reset password form
            setSuccessMessage('Verification code sent. Check your email.');
        } catch (error) {
            setLoading(false); // Stop loading spinner
            setForgotPasswordError(error.message || 'Failed to send verification code. Please check your email and try again.');
        }
    };

    // Handle reset password logic
    const handleResetPassword = async () => {
        setResetPasswordError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordMatchError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const result = await actions.confirmForgotPassword(email, verificationCode, newPassword);
            setLoading(false);
            if (result === true) {
                setSuccessMessage('Password reset successful!');
                setShowSuccessSpinner(true); // Show success spinner

                // Show success message for 2 seconds, then reload page
                setTimeout(() => {
                    setShowSuccessSpinner(false);
                    window.location.reload(); // Reload page after 2 seconds
                }, 2000);
            } else {
                setResetPasswordError(result); // Show error from AWS
            }
        } catch (error) {
            setLoading(false);
            setResetPasswordError('Invalid verification code or another error occurred.');
        }
    };

    const handleInputChange = () => {
        setLoginError(null); // Clear login error message on input change
    };

    return (
        <div className="login-container">
            {/* Centered page spinner */}
            {loading && (
                <div className="overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <div className="login-left">
                <img
                    src="https://staticloginsignuppage.s3.amazonaws.com/loginsignupimage.jpg"
                    alt="Phone Illustration"
                    className="login-image"
                />
            </div>
            <div className="login-right">
                <div className="form-container">
                    <h1>Welcome Back!</h1>
                    <p>Please login to your account</p>
                    <div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Email"
                                value={useremail}
                                onChange={(e) => { setUserEmail(e.target.value); handleInputChange(); }}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                                required
                            />
                        </div>
                        <button type="button" className="login-button" onClick={handleLogin}>
                            Login
                        </button>
                        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                        <div className="forgot-password">
                            <button type="button" onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>
                        </div>
                    </div>

                    {/* Modal for Forgot Password */}
                    {showForgotPassword && (
                        <div className="modal show" style={{ display: 'block' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Forgot Password</h5>
                                        <button type="button" className="close" onClick={() => setShowForgotPassword(false)}>
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="input-group">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="button" className="login-button" onClick={handleForgotPassword}>
                                            Send Verification Code
                                        </button>
                                        {forgotPasswordError && <p style={{ color: 'red' }}>{forgotPasswordError}</p>}
                                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal for Reset Password */}
                    {showResetPassword && (
                        <div className="modal show" style={{ display: 'block' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Reset Password</h5>
                                        <button type="button" className="close" onClick={() => setShowResetPassword(false)}>
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                placeholder="Verification Code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {passwordMatchError && <p style={{ color: 'red' }}>{passwordMatchError}</p>}
                                        <button type="button" className="login-button" onClick={handleResetPassword}>
                                            Reset Password
                                        </button>
                                        {resetPasswordError && <p style={{ color: 'red' }}>{resetPasswordError}</p>}
                                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Spinner Section */}
                    {showSuccessSpinner && (
                        <div className="success-spinner">
                            <div className="spinner"></div>
                            <p>Password reset successful! Redirecting...</p>
                        </div>
                    )}

                    <div className="signup-section">
                        <h2>New Here?</h2>
                        <p>Sign up and get started</p>
                        <button className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
