import { 
    CognitoIdentityProviderClient, 
    InitiateAuthCommand, 
    GetUserCommand, 
    SignUpCommand, 
    ConfirmSignUpCommand, 
    ForgotPasswordCommand, 
    ConfirmForgotPasswordCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import awsConfig from './awsConfig';
import Cookies from 'js-cookie';

const client = new CognitoIdentityProviderClient({ region: awsConfig.region });

const getState = ({ getStore, getActions, setStore }) => {
    let backend = process.env.REACT_APP_FLASK_BACKEND_URL;

    return {
        store: {
            token: null,
            emails: null,
            user: null, // To store user data
            error: null, // To store error messages
            signuperror: null
        },
        actions: {
            getname: async (email) => {
                try {
                    const response = await fetch(`${backend}addname`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email })
                    });

                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }

                    const data = await response.json();
                    setStore({ emails: data.email });
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },
            login: async (username, password) => {
                try {
                    const command = new InitiateAuthCommand({
                        AuthFlow: "USER_PASSWORD_AUTH",
                        ClientId: awsConfig.clientId,
                        AuthParameters: {
                            USERNAME: username,
                            PASSWORD: password,
                        },
                    });

                    const response = await client.send(command);
                    const accessToken = response.AuthenticationResult.AccessToken;
                    const user = await getActions().getUserAttributes(accessToken);

                    // Store token in cookies
                    Cookies.set("accessToken", accessToken, { expires: 1 }); // Expires in 1 day
                    setStore({ user: user, token: accessToken });
                } catch (err) {
                    setStore({ error: err.message });
                    console.error(err);
                }
            },
            getUserAttributes: async (accessToken) => {
                try {
                    const command = new GetUserCommand({ AccessToken: accessToken });
                    const response = await client.send(command);
                    const userData = {
                        username: response.Username,
                        email: response.UserAttributes.find(attr => attr.Name === 'email').Value,
                    };
                    return userData;
                } catch (error) {
                    console.error(error);
                }
            },
            logout: () => {
                Cookies.remove("accessToken");
                setStore({ user: null, token: null });
            },
            checkAuth: async () => {
                const accessToken = Cookies.get("accessToken");
                if (accessToken) {
                    const user = await getActions().getUserAttributes(accessToken);
                    setStore({ user, token: accessToken });
                }
            },
            signup: async (email, password) => {
                try {
                    const command = new SignUpCommand({
                        ClientId: awsConfig.clientId,
                        Username: email,  // Use email as username
                        Password: password,
                        UserAttributes: [
                            { Name: 'email', Value: email }
                        ]
                    });
            
                    const response = await client.send(command);
                    console.log("Signup Successful:", response);
                    // Optionally, handle success: navigate to another page, show a success message, etc.
                } catch (err) {
                    setStore({ signuperror: err.message });
                    console.error("Signup Error:", err);
                }
            },

            confirmSignup : async (email, verificationCode) => {
                try {
                    const command = new ConfirmSignUpCommand({
                        ClientId: awsConfig.clientId,
                        Username: email,
                        ConfirmationCode: verificationCode,
                    });
            
                    const response = await client.send(command);
                    console.log("Signup confirmed:", response);
            
                    // Only call insertEmailToDatabase if there were no errors
                    await getActions().insertEmailToDatabase(email);
            
                    // Optionally, handle successful confirmation: redirect, show success message, etc.
                } catch (err) {
                    setStore({ error: err.message });
                    console.error("Confirmation Error:", err);
                    // You can choose not to rethrow the error here if you want to suppress it
                    // throw err; // Rethrow the error to handle it in the Signup component
                }
            },
            
            insertEmailToDatabase: async (email) => {
                try {
                    const response = await fetch(`${backend}confirm_signup`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email })
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error adding email to database");
                    }
            
                    const data = await response.json();
                    console.log("Email added to database:", data);
                    return data;
                } catch (error) {
                    console.error("Error adding email to database:", error);
                    throw error;
                }
            },
            
            forgotPassword: async (email) => {
                try {
                    const command = new ForgotPasswordCommand({
                        ClientId: awsConfig.clientId,
                        Username: email,
                    });
            
                    const response = await client.send(command);
                    console.log("Forgot Password Initiated:", response);
                    // Optionally, handle success: navigate to another page, show a success message, etc.
                } catch (err) {
                    setStore({ error: err.message });
                    console.error("Forgot Password Error:", err);
                }
            },
            
            confirmForgotPassword: async (email, verificationCode, newPassword) => {
                try {
                    const command = new ConfirmForgotPasswordCommand({
                        ClientId: awsConfig.clientId,
                        Username: email,
                        ConfirmationCode: verificationCode,
                        Password: newPassword,
                    });
            
                    const response = await client.send(command);
                    console.log("Password Reset Successful:", response);
                    // Optionally, handle success: navigate to another page, show a success message, etc.
                } catch (err) {
                    setStore({ error: err.message });
                    console.error("Password Reset Error:", err);
                }
            }
        }
    };
};

export default getState;
