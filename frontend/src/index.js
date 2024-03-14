import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./style/flexboxgrid.min.css";
import './style/index.css';
// import 'bootstrap/dist/css/bootstrap.min.css'
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import "./i18n";

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} variant="success">
    <BrowserRouter>
      <AuthProvider>
        <Routes>
            <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
