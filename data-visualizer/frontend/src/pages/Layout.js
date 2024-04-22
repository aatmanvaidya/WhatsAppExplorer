import React, { useState, createContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import MessagePopup from "../components/MessagePopup";
// import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Whatsapp from "./whatsapp/Whatsapp"
import Telegram from "./telegram/Telegram"
import Facebook from "./facebook/Facebook"

export const SetPopupContext = createContext();

const Routing = (props) => {
  const [popup, setPopup] = useState({
    open: false,
    severity: "",
    message: "",
  });

  return (
    <BrowserRouter>
      <SetPopupContext.Provider value={setPopup}>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Login />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/telegram" element={<Telegram />} />
          <Route path="/facebook" element={<Facebook />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <MessagePopup
          open={popup.open}
          setOpen={(status) =>
            setPopup({
              ...popup,
              open: status,
            })
          }
          severity={popup.severity}
          message={popup.message}
        />
      </SetPopupContext.Provider>
    </BrowserRouter>
  );
};

export default Routing;
