import React, { useState, useEffect } from "react";
import getState from "./flux.js";
import Cookies from "js-cookie";

export const Context = React.createContext(null);

const injectContext = (PassedComponent) => {
  const StoreWrapper = (props) => {
    // Initialize state using getState
    const [state, setState] = useState(() =>
      getState({
        getStore: () => state.store,
        getActions: () => state.actions,
        setStore: (updatedStore) =>
          setState((prevState) => ({
            ...prevState,
            store: { ...prevState.store, ...updatedStore },
          })),
      })
    );

    useEffect(() => {
      const initialize = async () => {
        try {
          // Retrieve token from cookies
          const token = Cookies.get("accessToken");
          console.log("Retrieved token:", token);

          if (token) {
            // Fetch user data using the token
            const userData = await state.actions.getUserAttributes(token);
            console.log("Retrieved user data:", userData);

            if (userData) {
              // Update state with user and token
              setState((prevState) => ({
                ...prevState,
                store: {
                  ...prevState.store,
                  user: userData,
                  token: token,
                },
              }));

              // Fetch user ID from backend using email
              const userId = await state.actions.getUserIdByEmail(userData.email);
              console.log("Retrieved user ID:", userId);

              if (userId) {
                // Update state with active user ID
                setState((prevState) => ({
                  ...prevState,
                  store: {
                    ...prevState.store,
                    activeuserid: userId,
                  },
                }));

                // Fetch Stream token after setting active user ID
                await state.actions.getStreamToken(userId);
                await state.actions.getChannels(userId)
              }
            }
          }

          // Fetch initial phone data
          await state.actions.getPhones();
          await state.actions.getAllSold()
        } catch (error) {
          console.error("Error initializing user data and Stream token:", error);
        }
      };

      initialize();
      // Dependency array ensures effect runs only once after mount
    }, []); // You might not need state.actions as a dependency unless it changes

    return (
      <Context.Provider value={state}>
        <PassedComponent {...props} />
      </Context.Provider>
    );
  };

  return StoreWrapper;
};

export default injectContext;
