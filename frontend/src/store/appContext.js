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
            const token = Cookies.get("accessToken");
            if (token) {
                state.actions.getUserAttributes(token).then(userData => {
                    if (userData) {
                        setState(state => ({
                            ...state,
                            store: {
                                ...state.store,
                                user: userData,
                                token: token
                            }
                        }));
                    }
                }).catch(error => {
                    console.error("Error fetching user data:", error);
                });
            };            
            state.actions.getPhones();
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
