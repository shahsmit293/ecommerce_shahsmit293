import React from "react";
import { Route, Routes } from "react-router-dom";

import { App } from "./pages/App";
import injectContext from "./store/appContext";

//create your first component
const Layout = () => {
    return (
        <div>
            <Routes>
                <Route element={<App />} path="/" />
            </Routes>
        </div>
    );
};

export default injectContext(Layout);