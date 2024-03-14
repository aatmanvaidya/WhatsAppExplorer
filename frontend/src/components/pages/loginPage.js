import React from "react";
import { useState, useEffect, useRef } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { Button } from "@mui/material";
import axios from "../../api/axios";
import Alert from "@mui/material/Alert";
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const Login_URL = "/login";

function LoginPage() {
  const { setAuth, persist, setPersist } = useAuth();
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/allUsers";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [err, setErr] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErr("");
  }, [user, password]);

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  // var button = document.getElementById('button');

  // button.addEventListener('click', login, false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        Login_URL,
        JSON.stringify({ user, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      // console.log(response);
      const region = response?.data?.region;
      if(region)
        i18n.changeLanguage(region);
      const accessToken = response?.data?.accessToken;
      const role = response?.data?.role;
      const surveyDisabled = response?.data?.surveyDisabled;
      setAuth({ user, password, accessToken, role, surveyDisabled });
      setUser("");
      setPassword("");
      //   sessionStorage.setItem("logInfo", "ADMIN");
      navigate(from, { replace: true });
    } catch (error) {
      if (!error?.response) {
        setErr("Server error");
      } else if (error.response?.status === 400) {
        setErr("Missing credentials");
      } else if (error.response?.status === 401) {
        setErr("Unauthorized");
      } else {
        setErr("Login Failed");
      }

      errRef.current.focus();
    }
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mt-2 rounded-xl" paddingLeft={matches ? 0 : 6} paddingRight={matches ? 0 : 6}>
      <Grid container className="bg-white rounded-3xl shadow-2xl flex w-2/3 max-w-4xl text-center">
        {matches ? (
          <Grid item xs={12} md={5} lg={5} className="p-5 bg-blue-500 text-white py-36 rounded-3xl">
            <h2 className="text-2xl font-bold mb-2">WhatsappExplorer</h2>
            <div className="border-2 mb-2 w-12 inline-block"></div>
            <p className="mb-11">What's up on WhatsApp?</p>
            {/* <a href='/signup' className='inline-block border-2 rounded-full px-10 py-2 hover:bg-white hover:text-blue-500'>Sign Up</a> */}
          </Grid>
        ) : (
          <Grid item xs={12} md={5} lg={5} className="bg-blue-500 text-white" paddingTop={6} paddingBottom={2} sx={{ borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}>
            <h2 className="text-2xl font-bold mb-2">WhatsappExplorer</h2>
            <div className="border-2 mb-2 w-12 inline-block"></div>
            <p className="mb-11">What's up on WhatsApp?</p>
            {/* <a href='/signup' className='inline-block border-2 rounded-full px-10 py-2 hover:bg-white hover:text-blue-500'>Sign Up</a> */}
          </Grid>
        )}
        <Grid item xs={12} md={7} lg={7} className={matches ? "bg-gray-50 text-gray-900 rounded-3xl" : "bg-gray-50 text-gray-900 pb-5"} sx={matches ? {} : { borderBottomLeftRadius: "1.5rem", borderBottomRightRadius: "1.5rem" }}>
          {err === "" ? (
            <></>
          ) : (
            <Alert severity="error" ref={errRef} aria-live="assertive">
              {err}
            </Alert>
          )}
          <div className="text-right p-1 pr-2 font-bold">
            <span className="text-blue-500 text-right inline-block">
              Whatsapp
            </span>
            Explorer
          </div>
          <div className="pt-10 text-blue-500 font-bold text-2xl">
            {t('signInToYourAccount')}
          </div>
          <div className="border-2 mb-2 w-12 inline-block  border-blue-500"></div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center ">
              <div className="bg-blue-50 p-2 w-50 flex items-center m-2">
                <FaRegEnvelope className="text-gray-400 m-2" />
                <input
                  type="text"
                  name="user"
                  placeholder={t('username')}
                  id="user"
                  className="bg-blue-50 outline-none"
                  ref={userRef}
                  onChange={(e) => setUser(e.target.value)}
                  value={user}
                />
              </div>
              <div className="bg-blue-50 p-2 flex items-center m-2">
                <MdPassword className="text-gray-400 m-2" />
                <input
                  type="password"
                  name="password"
                  placeholder={t('password')}
                  id="password"
                  className="bg-blue-50 outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>
            <FormControlLabel
              label={t('rememberThisDevice')}
              control={
                <Checkbox checked={persist} onChange={togglePersist} />
              }
            />
            <br />

            <Button variant="outlined" type="submit">
              Login
            </Button>
          </form>
          {/* <button id="button" className='inline-block border-2 border-blue-400 text-blue-400 font-bold rounded-full px-10 py-2 m-10 hover:bg-blue-500 hover:text-white'>Sign In</button> */}
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginPage;
