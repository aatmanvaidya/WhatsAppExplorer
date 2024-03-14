import React from "react";
import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { FormControl, TextField, Button, MenuItem, Select } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function NewSurveyor() {
  const [username, setUsername] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phNo, setPhNo] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [surveyDisabled, setSurveyDisabled] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleClose2 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen2(false);
  };

  const handleUserNameChange = (e) => {
    setUsername(e.target.value.trim());
    // console.log(username);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    // console.log(name);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // console.log(password);
  };

  const handlePhNoChange = (e) => {
    setPhNo(e.target.value);
    // console.log(username);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // console.log(username);
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    // console.log(username);
  };
  const handleBioChange = (e) => {
    setBio(e.target.value);
    // console.log(username);
  };

  const handleSurveyDisabledChange = (e) => {
    if (e.target.value === "false")
      setSurveyDisabled(false);
    else
      setSurveyDisabled(true);
  };

  const handleLanguageChange = (event) => setSelectedLanguage(event.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (
      username === "" ||
      name === "" ||
      password === "" ||
      phNo === "" ||
      email === "" ||
      address === "" ||
      bio === ""
    ) {
      return;
    }

    const controller = new AbortController();
    const data = {
      user: username,
      name: name,
      password: password,
      contactInfo: {
        phoneNumber: phNo,
        email: email,
        address: address,
      },
      bio: bio,
      role: "surveyor",
      admin: auth.user,
      surveyDisabled: surveyDisabled,
      region: selectedLanguage,
      signal: controller.signal,
    };
    axios
      .post("/register-surveyor", data)
      .then((res) => {
        // console.log(res);
        setOpen(true);
      })
      .catch((err) => {
        console.log(err);
        // Check if status code 409
        if (err.response.status === 409) {
          setOpen2(true);
          return;
        } else {
          navigate("/login", { state: { from: location }, replace: true });
        }
      })
      .finally(() => {
        controller.abort();
      });

    setUsername("");
    setName("");
    setPassword("");
    setPhNo("");
    setEmail("");
    setAddress("");
    setBio("");
    setSurveyDisabled(false);
  };

  const BoxStyle = {
    width: "35%",
    backgroundColor: "white",
    padding: "2rem 5rem 3rem",
    borderRadius: "10px 10px 10px 10px",
    boxShadow: "10px 10px 31px -6px rgba(0,0,0,0.75)",
  };

  const BoxStyleMobile = {
    width: "80%",
    backgroundColor: "white",
    padding: "2rem 3rem 3rem",
    borderRadius: "10px 10px 10px 10px",
    boxShadow: "10px 10px 31px -6px rgba(0,0,0,0.75)",
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mt-2 rounded-xl">
      <Box className="flex flex-col items-center justify-center" sx={matches ? BoxStyle : BoxStyleMobile}>
        <FormControl fullWidth>
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="user"
            placeholder="Username*"
            id="user"
            onChange={handleUserNameChange}
            value={username}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="name"
            placeholder="Name*"
            id="name"
            onChange={handleNameChange}
            value={name}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="password"
            name="password"
            placeholder="Password*"
            id="password"
            onChange={handlePasswordChange}
            value={password}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="phNo"
            placeholder="Phone Number*"
            id="phNo"
            onChange={handlePhNoChange}
            value={phNo}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="email"
            placeholder="Email*"
            id="email"
            onChange={handleEmailChange}
            value={email}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="address"
            placeholder="Address*"
            id="address"
            onChange={handleAddressChange}
            value={address}
            required
          />
          <TextField
            variant="standard"
            margin="normal"
            type="text"
            name="bio"
            placeholder="Bio*"
            id="bio"
            onChange={handleBioChange}
            value={bio}
            required
          />
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            variant="standard"
            margin="normal"
            placeholder="Region Language"
            sx={{ mb: '1rem' }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
            <MenuItem value="pt">Portuguese</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </Select>
          <FormControl component="fieldset" sx={{ mt: "1rem" }}>
            <FormLabel component="legend">Survey</FormLabel>
            <RadioGroup
              aria-label="survey-status"
              name="surveyStatus"
              value={surveyDisabled}
              onChange={handleSurveyDisabledChange}
            >
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="On"
              />
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="Off"
              />
            </RadioGroup>
          </FormControl>
          <Button
            sx={{ mt: "2rem" }}
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Add Surveyor
          </Button>
        </FormControl>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Surveyor Registered Successfully!
        </Alert>
      </Snackbar>
      <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
        <Alert onClose={handleClose2} severity="error" sx={{ width: "100%" }}>
          Username already exists!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default NewSurveyor;
