import "./App.css";

import React, { useState, useEffect, createContext } from "react";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";

import Layout from "./pages/Layout";
import * as loader from "./assets/loader.json";
import moment from "moment-timezone";

moment.tz.setDefault("Etc/GMT+0");

function App() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loader.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const [load, setLoad] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    }, 2000);
  }, []);

  return !load ? (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FadeIn>
        <div>
          <Lottie options={defaultOptions} height={320} width={320} />
        </div>
      </FadeIn>
      <div style={{ textAlign: "center", position: "fixed", bottom: "20px" }}>
        Loading ...
      </div>
    </div>
  ) : (
    <FadeIn>
      <Layout />
    </FadeIn>
  );
}

export default App;
