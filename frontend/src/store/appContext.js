import React, { useState, useEffect } from "react";
import getState from "./flux.js";
import Cookies from 'js-cookie';

export const Context = React.createContext(null);

const injectContext = PassedComponent => {
    const StoreWrapper = props => {
        const [state, setState] = useState(
            getState({
                getStore: () => state.store,
                getActions: () => state.actions,
                setStore: updatedStore =>
                    setState({
                        store: Object.assign(state.store, updatedStore),
                        actions: { ...state.actions }
                    })
            })
        );

        useEffect(() => {
            const initialize = async () => {
                const token = Cookies.get("accessToken");
                if (token) {
                    try {
                        const userData = await state.actions.getUserAttributes(token);
                        if (userData) {
                            setState(state => ({
                                ...state,
                                store: {
                                    ...state.store,
                                    user: userData,
                                    token: token
                                }
                            }));

                            // Fetch user ID from backend using the email in userData
                            const userId = await state.actions.getUserIdByEmail(userData.email);
                            if (userId) {
                                setState(state => ({
                                    ...state,
                                    store: {
                                        ...state.store,
                                        activeuserid: userId
                                    }
                                }));

                                // Fetch Stream token after setting activeuserid
                                await state.actions.getStreamToken(userId);
                            }
                        }
                    } catch (error) {
                        console.error("Error initializing user data and Stream token:", error);
                    }
                }
                
                // Fetch other initial data
                await state.actions.getPhones();
            };

            initialize();

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // <-- Include state.actions in the dependency array

        return (
            <Context.Provider value={state}>
                <PassedComponent {...props} />
            </Context.Provider>
        );
    };
    return StoreWrapper;
};

export default injectContext;
