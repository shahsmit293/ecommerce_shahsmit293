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
            cartdetails: [],
            allfavorites: [],
            allpurchased: [],
            mysold: [],
            allsold: [],
            filteredPhones: [],
            alllistedphones: [],
            subscribed:null,
            allmeetings: [],
            meetingserror:null
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
                    Cookies.set("accessToken", accessToken, {
                        expires: 1,       // Cookie expires in 1 day
                        path: '/',        // Cookie is available throughout the site
                        sameSite: 'Lax' // Adjust as needed for cross-origin requests
                    });
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
                    const accessToken = Cookies.get("accessToken");
                    const formData = new FormData();
                    formData.append('phoneDetails', JSON.stringify(phoneDetails));

                    images.forEach((image) => {
                        formData.append('images', image);
                    });

                    const response = await fetch(`${backend}add_phone`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                          },
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

            updatePrice : async (phoneid, newprice) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                  const response = await fetch(`${backend}edit_price`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                      phone_id: phoneid,
                      new_price: newprice,
                    }),
                  });
              
                  if (!response.ok) {
                    throw new Error('Failed to update price');
                  }
              
                  const data = await response.json();
                  console.log('Price updated successfully:', data);
              
                } catch (error) {
                  console.error('Error updating price:', error);
                }
              },

              updatePaypalEmail : async (phoneid, new_paypal_email) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                  const response = await fetch(`${backend}edit_paypalemail`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                      phone_id: phoneid,
                      new_paypal_email: new_paypal_email,
                    }),
                  });
              
                  if (!response.ok) {
                    throw new Error('Failed to update paypal email');
                  }
              
                  const data = await response.json();
                  console.log('Paypal email updated successfully:', data);
              
                } catch (error) {
                  console.error('Error updating price:', error);
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
                        throw new Error(errorData.error || "Failed to fetch phone");
                    }
            
                    const data = await response.json();
            
                    // Ensure the response is an object, not an array
                    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                        setStore({ each_phone: data });
                        console.log("Fetched phone:", data);
                        return data;
                    } else {
                        throw new Error("Phone data is unavailable");
                    }
                } catch (error) {
                    console.error("Error fetching phone:", error);
                    throw error;
                }
            },
            

            deletePhone: async (phone_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}deletephone`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ phone_id }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete item from cart');
                    }

                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error deleting item from cart:', error);
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

            addToCart: async (buyer_id, phone_sell_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}addcart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                            buyer_id,
                            phone_sell_id
                        }),
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add item to cart');
                    }
            
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error adding item to cart:', error);
                    throw error;
                }
            },
            
            getcart: async (buyer_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getcart`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({cartdetails: data.phones})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details for buyer:", error);
                    throw error;
                }
            },

            deleteFromCart: async (buyer_id, phone_sell_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}deletecart`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id, phone_sell_id }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete item from cart');
                    }

                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error deleting item from cart:', error);
                    throw error;
                }
            },

            addToFavorite: async (buyer_id, phone_sell_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}addfavorite`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                            buyer_id,
                            phone_sell_id
                        }),
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add item to favorite');
                    }
            
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error adding item to favorites:', error);
                    throw error;
                }
            },
            
            getFavorite: async (buyer_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getfavorite`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({allfavorites: data.phones})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },

            deleteFavorite: async (buyer_id, phone_sell_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}deletefavorite`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id, phone_sell_id }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete item from favorites');
                    }

                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error deleting item from favorites:', error);
                    throw error;
                }
            },

            getPurchase: async (buyer_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getpurchase`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({allpurchased: data.phones})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },

            getSold: async (buyer_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getsold`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ buyer_id})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({mysold: data.phones})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },

            getAllSold: async () => {
                try {
                    const response = await fetch(`${backend}getallsold`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({allsold: data.allsoldphones})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },

            fetchFilteredPhones: async (filters) => {
                try {
                    const queryString = new URLSearchParams(filters).toString();
                    const response = await fetch(`${backend}filter-phones?${queryString}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch filtered phones");
                    }
            
                    const data = await response.json();
                    setStore({ filteredPhones: data.phones });
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching filtered phones:", error);
                    throw error;
                }
            },
            
            getalllistingphone: async (sellerid) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getmylisting`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ sellerid})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({alllistedphones: data.alllistedphones})
                    return data.alllistedphones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },

            addSubscribe: async (user_email) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}addsubscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                            user_email
                        }),
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add email to subscription table');
                    }
            
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error adding email to subsciption:', error);
                    throw error;
                }
            },

            getSubscribed: async (user_email) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getsubscriber`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ user_email})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch phone details");
                    }
            
                    const data = await response.json();
                    setStore({subscribed: data.subscribers.user_email})
                    return data.phones;
                } catch (error) {
                    console.error("Error fetching phone details:", error);
                    throw error;
                }
            },
        
            createMeeting: async (subscriber_email) => {
                try {
                    const zoomToken = sessionStorage.getItem("zoomtoken");
                    const accessToken = Cookies.get("accessToken");
            
                    if (!zoomToken) {
                        throw new Error("Zoom token is missing");
                    }
            
                    if (!accessToken) {
                        throw new Error("Access token is missing");
                    }
            
                    // Make POST request to backend to create the meeting
                    const response = await fetch(`${backend}create_meeting`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${zoomToken}`,
                            "x-access-token": accessToken
                        },
                        body: JSON.stringify({ subscriber_email }),
                        credentials: 'include'
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to create the meeting");
                    }
            
                    const meetingInfo = await response.json();
                    console.log("Meeting created successfully:", meetingInfo);
                    return meetingInfo;
                } catch (error) {
                    console.error("Error creating the meeting:", error);
                    throw error;
                }
            },
            
            
            getMeetings: async (subscriber_email) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}getmeetings`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ subscriber_email})
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch subscriber details");
                    }
            
                    const data = await response.json();
                    setStore({allmeetings: data.allmeetings})
                    return data.allmeetings;
                } catch (error) {
                    console.error("Error fetching subscriber details:", error);
                    setStore({meetingserror: error})
                    throw error;
                }
            },

            addParticipant: async (meeting_id, participant_email) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}addparticipant`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ meeting_id, participant_email })
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to add participant");
                    }
            
                    const data = await response.json();
                    return data;
                } catch (error) {
                    return { error: error.message };
                }
            },
            
        
            deleteMeeting: async (meeting_id) => {
                try {
                    const accessToken = Cookies.get("accessToken");
                    const response = await fetch(`${backend}delete_meeting`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ meeting_id: meeting_id })
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to delete the meeting");
                    }
            
                    const result = await response.json();
                    console.log("Meeting deleted successfully:", result);
                    return result;
                } catch (error) {
                    console.error("Error deleting the meeting:", error);
                    throw error;
                }
            }
            

        }
    };
};

export default getState;
