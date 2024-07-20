import { 
    CognitoIdentityProviderClient, 
    InitiateAuthCommand, 
    GetUserCommand, 
    SignUpCommand, 
    ConfirmSignUpCommand, 
    ForgotPasswordCommand, 
    ConfirmForgotPasswordCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import Cookies from 'js-cookie';
import { StreamChat } from 'stream-chat';

// Initialize Cognito client with environment variable
const client = new CognitoIdentityProviderClient({ region: process.env.REACT_APP_AWS_REGION });

const getState = ({ getStore, getActions, setStore }) => {
    let backend = process.env.REACT_APP_FLASK_BACKEND_URL;
    let clientId = process.env.REACT_APP_AWS_COGNITO_CLIENT_ID;
    const apiKey = process.env.REACT_APP_STREAM_API_KEY;

    return {
        store: {
            token: null,
            user: null,
            error: null,
            signuperror: null,
            addedphones: null,
            phones: [],
            each_phone: null,
            streamToken: null,
            chatClient: null,
            activeuserid: null,
            channelId:null,
            channelslist: null,
            channel: null,
        },
        actions: {
            login: async (useremail, password) => {
                try {
                    const command = new InitiateAuthCommand({
                        AuthFlow: "USER_PASSWORD_AUTH",
                        ClientId: clientId,
                        AuthParameters: {
                            USERNAME: useremail,
                            PASSWORD: password,
                        },
                    });

                    const response = await client.send(command);
                    const accessToken = response.AuthenticationResult.AccessToken;

                    Cookies.set("accessToken", accessToken, { expires: 1 });
                    setStore({ token: accessToken });

                    const user = await getActions().getUserAttributes(accessToken);
                    setStore({ user });

                    const userid = await getActions().getUserIdByEmail(useremail);

                    await getActions().getStreamToken(userid);
                    await getActions().getChannels(userid)

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
            
            getUserIdByEmail: async (useremail) => {
                try {
                    const response = await fetch(`${backend}get_user_id`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ useremail })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch user ID");
                    }

                    const data = await response.json();
                    setStore({ activeuserid: data.user_id });
                    return data.user_id; // Return the user ID to be used in the next step
                } catch (error) {
                    console.error("Error fetching user ID:", error);
                    throw error;
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
                        ClientId: clientId,
                        Username: email,
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

            confirmSignup: async (email, verificationCode) => {
                try {
                    const command = new ConfirmSignUpCommand({
                        ClientId: clientId,
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
                        ClientId: clientId,
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
                        ClientId: clientId,
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
            },

            addPhone: async (phoneDetails, images) => {
                try {
                    const formData = new FormData();
                    formData.append('phoneDetails', JSON.stringify(phoneDetails));

                    images.forEach((image) => {
                        formData.append('images', image);
                    });

                    const response = await fetch(`${backend}add_phone`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add phone');
                    }

                    const data = await response.json();
                    console.log('Phone added successfully:', data);
                    setStore({ addedphones: data });
                    return data;
                } catch (error) {
                    console.error('Error adding phone:', error);
                    throw error;
                }
            },

            getPhones: async () => {
                try {
                    const response = await fetch(`${backend}phones`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phones");
                    }

                    const data = await response.json();
                    setStore({ phones: data });
                    console.log("Fetched phones:", data);
                    return data;
                } catch (error) {
                    console.error("Error fetching phones:", error);
                    throw error;
                }
            },

            get_each_phone: async (seller_id) => {
                try {
                    const response = await fetch(`${backend}phones/${seller_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phones");
                    }

                    const data = await response.json();
                    setStore({ each_phone: data });
                    console.log("Fetched phones:", data);
                    return data;
                } catch (error) {
                    console.error("Error fetching phones:", error);
                    throw error;
                }
            },

            getStreamToken : async (activeuserid) => {
                try {
                    const response = await fetch(`${backend}get_stream_token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ activeuserid: String(activeuserid) })
                    });
            
                    if (!response.ok) {
                        throw new Error('Failed to get Stream token');
                    }
            
                    const data = await response.json();
                    console.log('Token payload:', data.token);
            
                    const chatClient = getStore().chatClient || StreamChat.getInstance(apiKey);
            
                    if (chatClient.userID) {
                        await chatClient.disconnectUser();
                    }

         
                    await chatClient.connectUser(
                        { id: String(activeuserid) },
                        data.token
                    );
                    
                    console.log(chatClient)
                    setStore({ streamToken: data.token, chatClient});
            
                } catch (error) {
                    console.error('Error fetching Stream token:', error);
                    throw error;
                }
            },
            checkAndCreateChannel: async (activeuserid, targetuserid) => {
                try {
                    const response = await fetch(`${backend}check_and_create_channel`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ activeuserid: String(activeuserid), targetuserid: String(targetuserid) })
                    });
        
                    if (!response.ok) {
                        throw new Error('Failed to check and create channel');
                    }
        
                    const data = await response.json();
                    setStore({ channelId: data.channel_id, channel : data.channel });
                } catch (error) {
                    console.error('Error checking and creating channel:', error);
                }
            },

            getChannels: async (activeuserid) => {
                try {
                    const response = await fetch(`${backend}get_channels`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ activeuserid: String(activeuserid) })
                    });
            
                    if (!response.ok) {
                        throw new Error('Failed to get channels');
                    }
            
                    const data = await response.json();
                    setStore({ channelslist: data.channels });
                } catch (error) {
                    console.error('Error fetching channels:', error);
                }
            },

        }
    };
};

export default getState;
