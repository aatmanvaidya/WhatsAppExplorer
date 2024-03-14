import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import { Button, Chip, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import axios from "../../api/axios";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import CircularProgress from "@mui/material/CircularProgress";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useTranslation } from 'react-i18next';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxHeight: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const modalStyleMobile = {
  width: "80vw",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxHeight: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const timerStyle = {
  fontFamily: "Montserrat",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const textStyle = {
  color: "#aaa",
};

const valueStyle = {
  fontSize: "40px",
};

function NewUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [username, setUsername] = React.useState("");

  const [formActive, setFormActive] = React.useState(true);

  const [phNo, setPhNo] = React.useState("");
  const [addr, setAddr] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [waNo, setWaNo] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [userId, setUserId] = React.useState(v4());
  const [qr, setQr] = React.useState("");
  const { auth } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [openPrompt, setOpenPrompt] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [surveyCompleted, setSurveyCompleted] = React.useState(false);
  const [geolocation, setGeolocation] = React.useState({});

  const { enqueueSnackbar } = useSnackbar();
  const [qrIsAvailable, setQrIsAvailable] = React.useState(false);
  const [qrExpired, setQrExpired] = React.useState(false);

  const [WaitClientController, setWaitClientController] = React.useState(null);
  const [GenerateQRController, setGenerateQRController] = React.useState(null);

  const renderTime = ({ remainingTime }) => {
    return (
      <div style={timerStyle}>
        <div style={textStyle}>Remaining</div>
        <div style={valueStyle}>{remainingTime}</div>
        <div style={textStyle}>seconds</div>
      </div>
    );
  };

  useEffect(() => {
    let formDisabledSurveyors = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10', 'i11', 'i12', 'i13', 'i14', 'i15', 'i16', 'i17', 'i18', 'i19', 'i20', 'bharat_muslim', 'iaimpact', 'codeforafrica', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20', 'max']
    if (auth.surveyDisabled) {
      setFormActive(false);
      setSurveyCompleted(true);
      console.log(auth.user);
      console.log("Form Disabled for User");
    }
    if (location.state && location.state.data) {
      setUsername(location.state.data.username)
      // setPhNo(location.state.data.phNo)
      // setAddr(location.state.data.addr)
      setEmail(location.state.data.email)
      setWaNo(location.state.data.waNo)
      setBio(location.state.data.bio)
      setUserId(location.state.data.userId)
      setChecked(true)
      setSurveyCompleted(true)
    }
  }, [location.state]);

  const handleFormSubmit = () => {

    // check if username contains only alphanumeric characters or underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      enqueueSnackbar("Username can only contain alphanumeric characters", {
        autoHideDuration: 5000,
        variant: "error",
      });
      return false;
    }
    if (username === "") {
      enqueueSnackbar("Please Enter a Username", {
        autoHideDuration: 5000,
        variant: "error",
      });
      return false;
    }
    return true;
  };

  const getLocation = () => {

    if(Object.keys(geolocation).length !== 0)
      return;

    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      setGeolocation(
        {
          "latitude": latitude,
          "longitude": longitude
        }
      );
    }
    
    function error(err) {
      console.log("Unable to retrieve your location");
      setGeolocation(
        {
          "latitude": "NA",
          "longitude": "NA",
          "code": err.code,
          "msg": err.message,
        }
      );
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
      setGeolocation(
        {
          "latitude": "NA",
          "longitude": "NA",
          "code": 4,
          "msg": "Geolocation not supported",
        }
      );
    }
  }

  const generateQR = () => {
    const result = handleFormSubmit();
    console.log(result);
    if (result) {
      setOpen(true);
    }
    else {
      return;
    }
    setQrExpired(false);
    setQrIsAvailable(false);

    const client_id = userId;
    // setUserId(client_id);
    const controller = new AbortController();
    setGenerateQRController(controller);
    axios
      .post(
        "/authUser2",
        { clientId: client_id },
        { signal: controller.signal }
      )
      .then(function (response) {
        let qr_code = response.data;
        setQrExpired(false);
        setQr(qr_code);
        setQrIsAvailable(true);

        // Now call function to wait for response from client
        waitForClientResponse(client_id);
      })
      .catch(function (error) {
        if (error.name === "CanceledError") {
          console.log("Aborted");
          enqueueSnackbar("Authentication Cancelled", {
            autoHideDuration: 5000,
            variant: "info",
          });
          killClient(client_id);
          setOpen(false);
        } else {
          console.log(error);
          enqueueSnackbar("Some error occured while generating QR", {
            autoHideDuration: 5000,
            variant: "error",
          });
        }
        setOpenPrompt(false);
      });
  };

  const waitForClientResponse = (client_id) => {
    const controller = new AbortController();
    setWaitClientController(controller);
    const newParticipant = {
      name: username.replace(/ /g, ""),
      clientId: client_id,
      surveyor: auth.user,
      signal: controller.signal,
      bio: bio,
      contactInfo: {
        whatsAppNumber: waNo,
        email: email,
      },
      location: geolocation,
    };
    axios
      .post(
        "/waitForClient",
        { clientId: client_id, participant: newParticipant },
        { signal: controller.signal }
      )
      .then(function (response) {
        if (response.data === "Participant added") {
          // addNewUser(client_id);
          enqueueSnackbar("User Added!", {
            autoHideDuration: 5000,
            variant: "success",
          });
          navigate("/allUsers", {
            state: { from: location },
            replace: true,
          });
        } else if (response.data === "qr expired") {
          setQrExpired(true);
          setQrIsAvailable(false);
          enqueueSnackbar("QR Code Expired", {
            autoHideDuration: 5000,
            variant: "error",
          });
        }
        else if (response.data === "error adding user") {
          enqueueSnackbar("Error adding user", {
            autoHideDuration: 5000,
            variant: "error",
          });
          navigate("/login", { state: { from: location }, replace: true });
        }
      })
      .catch(function (error) {
        // check if error due to cancellation
        if (error.name === "CanceledError") {
          console.log("Aborted");
          enqueueSnackbar("Authentication Cancelled", {
            autoHideDuration: 5000,
            variant: "info",
          });
        } else {
          console.log(error);
          enqueueSnackbar("Authentication Failed", {
            autoHideDuration: 5000,
            variant: "error",
          });
          setOpen(false);
        }
        setOpenPrompt(false);
      });
  };
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleClose = () => {
    setOpen(false);

    if (qrIsAvailable) {
      console.log(WaitClientController);
      WaitClientController.abort();
      setQrIsAvailable(false);
      setQr("");
    } else {
      GenerateQRController.abort();
    }
  };
  const handleClosePrompt = () => setOpenPrompt(false);

  const axiosPrivate = useAxiosPrivate();

  const handleSurveyPage = () => {
    let stateData = {
      username: username,
      // phNo: phNo,
      // addr: addr,
      email: email,
      waNo: waNo,
      bio: bio,
      userId: userId
    }
    navigate("/survey-form", {
      state: { from: location, clientName: username, clientId: userId, formType: 0, data: stateData },
    });
  }

  const handleUserNameChange = (e) => {
    setUsername(e.target.value);
    // console.log(username);
  };
  const handlePhNoChange = (e) => {
    setPhNo(e.target.value);
    // console.log(username);
  };
  const handleAddrChange = (e) => {
    setAddr(e.target.value);
    // console.log(username);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // console.log(username);
  };
  const handleWaNoChange = (e) => {
    setWaNo(e.target.value);
    // console.log(username);
  };
  const handleBioChange = (e) => {
    setBio(e.target.value);
    // console.log(username);
  };
  const SnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };

  const killClient = (clientId) => {
    axios
      .get("/killClient?clientId=" + clientId)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };

  const BoxStyle = {
    width: "35%",
    backgroundColor: "white",
    padding: "2rem 5rem 3rem",
    borderRadius: "10px 10px 10px 10px",
    boxShadow: "10px 10px 31px -6px rgba(0,0,0,0.75)",
  };

  const BoxStyleMobile = {
    width: "90%",
    backgroundColor: "white",
    padding: "2rem 3rem 3rem",
    borderRadius: "10px 10px 10px 10px",
    boxShadow: "10px 10px 31px -6px rgba(0,0,0,0.75)",
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  getLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 rounded-xl">
      <Box
        className="flex flex-col items-center justify-center"
        sx={matches ? BoxStyle : BoxStyleMobile}
      >
        <Chip label={`User ID : ${userId}`} variant="outlined" />
        <TextField
          fullWidth
          id="standard-basic"
          label={t('username')}
          variant="standard"
          value={username}
          onChange={handleUserNameChange}
          margin="dense"
          multiline
        />
        {/* <TextField
          fullWidth
          id="standard-basic"
          label="Phone Number"
          variant="standard"
          value={phNo}
          onChange={handlePhNoChange}
          margin="dense"
          multiline
        /> */}
        {/* <TextField
          fullWidth
          id="standard-basic"
          label="Village"
          variant="standard"
          value={village}
          onChange={handleVillageChange}
          margin="dense"
          multiline
        />
        <TextField
          fullWidth
          id="standard-basic"
          label="Tehsil / Block"
          variant="standard"
          value={tehsilOrBlock}
          onChange={handleTehsilOrBlockChange}
          margin="dense"
          multiline
        />
        <TextField
          fullWidth
          id="standard-basic"
          label="Email"
          variant="standard"
          value={email}
          onChange={handleEmailChange}
          margin="dense"
          multiline
        />
        <TextField
          fullWidth
          id="standard-basic"
          label="Whatsapp Number"
          variant="standard"
          value={waNo}
          onChange={handleWaNoChange}
          margin="dense"
          multiline
        />
        <TextField
          fullWidth
          id="standard-basic"
          label="Bio"
          variant="standard"
          value={bio}
          onChange={handleBioChange}
          margin="dense"
          multiline
        /> */}
        {/* <TextField
          fullWidth
          id="standard-basic"
          variant="standard"
          value={"User Id : " + userId}
          disabled
          margin="dense"
          multiline
        /> */}
        {/* <Alert severity="success" color="info">
          {userId}
        </Alert> */}
        <FormControlLabel
          label={t('agreeToTermsAndConditions')}
          control={<Checkbox checked={checked} onChange={handleChange} />}
        />
        {formActive ? (surveyCompleted ? (
          <>
            <Alert severity="success" variant="outlined">{t('thankYouForSubmittingSurvey')}</Alert>
          </>
        ) : (
          <>
            <Button disabled={!checked} onClick={() => handleSurveyPage()}>
              {t('takeShortSurvey')}
            </Button>
          </>
        )) : null}

        <Button disabled={!checked || !surveyCompleted} onClick={() => setOpenPrompt(true)}>
          {t('generateQR')}
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={matches ? modalStyle : modalStyleMobile}>
          <Stack spacing={2} justifyContent="center" alignItems="center">
            {qrExpired ? (
              <>
                <Typography variant="p" align="center">
                  QR Code Expired
                </Typography>
                <div className="flex justify-center">
                  <Button onClick={generateQR}>Generate New QR</Button>
                </div>
              </>
            ) : !qrIsAvailable ? (
              <>
                <Typography variant="p" align="center">
                  Generating QR Code...
                </Typography>
                <div className="flex justify-center">
                  <CircularProgress />
                </div>
              </>
            ) : (
              <>
                <img src={qr} />
                <br />
                <CountdownCircleTimer
                  isPlaying
                  key={qr}
                  duration={60}
                  colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                  colorsTime={[60, 30, 15, 0]}
                  onComplete={() => {
                    return { shouldRepeat: false };
                  }}
                >
                  {renderTime}
                </CountdownCircleTimer>
              </>
            )}
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openPrompt}
        onClose={handleClosePrompt}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={matches ? modalStyle : modalStyleMobile}>
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="p" align="center" sx={{ mb: "5%" }}>
              {t('qrInstructionDescription')}
            </Typography>
            <Typography variant="p">{t('followInstructions')}</Typography>
            <Typography variant="p" align="left">
              1. {t('instruction1')}
              <br />
              2. {t('instruction2.1')} <MoreVertIcon /> {t('instruction2.2')} <SettingsIcon /> {t('instruction2.3')} <strong>{t('instruction2.4')}</strong>.
              <br />
              3. {t('instruction3')}
              <br />
              4. {t('instruction4')}
              <br />
              5. {t('instruction5')}
              <br />
            </Typography>
            <Button onClick={generateQR}>{t('generateQR')}</Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}

export default NewUser;
