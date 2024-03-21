import { useEffect, useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import KeyIcon from "@mui/icons-material/Key";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import isAuth from "../../lib/isAuth";
import { SetPopupContext } from "../Layout";
import constants from "../../assets/constants";

const Login = () => {
  const navigate = useNavigate();
  const setPopup = useContext(SetPopupContext);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  useEffect(() => {
    if (isAuth()) navigate("/login");
  }, []);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key, newValue) => {
    setData({ ...data, [key]: newValue });
  };

  const submitData = () => {
    axios
      .post(constants.apiLogin, data)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("type", response.data.type);
        localStorage.setItem("section", response.data.section);
        localStorage.setItem("platform", response.data.platform); 
        localStorage.setItem("restricted", response.data.restricted);
        setPopup({
          open: true,
          severity: "success",
          message: "Logged in successfully",
        });
        console.log(response);
        if(response.data.platform == "telegram")
          navigate("/telegram");
        else if(response.data.platform == "facebook")
            navigate("/facebook");
        else
          navigate("/whatsapp");

      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        console.log(err.response);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          background: "linear-gradient(-45deg, #F6FBA2, #20DED3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
        id="top-anchor"
      >
        <h1 style={{ fontSize: "30px", textAlign: "center", color: "#fff" }}>
          Login
        </h1>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            padding: isMobile ? "20px" : "50px 40px ",
            minWidth: isMobile ? "100vw" : "30vw",
            boxShadow:
              "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
          }}
        >
          <TextField
            label="Email"
            variant="outlined"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            style={{ margin: "10px" }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={data.password}
            onChange={(e) => handleChange("password", e.target.value)}
            style={{ margin: "10px" }}
          />
          <Button
            variant="contained"
            style={{ margin: "10px" }}
            onClick={() => submitData()}
          >
            Login <KeyIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
