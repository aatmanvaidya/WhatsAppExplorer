import React from "react";
import { v4 } from "uuid";
import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Modal from "@mui/material/Modal";
import Checkbox from "@mui/material/Checkbox";
import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { FormControl, TextField, Button, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { useSnackbar } from "notistack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import LoadingScreen from "./LoadingScreen";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

function NewIndividual() {
    const [username, setUsername] = React.useState("");
    const [userId, setUserId] = React.useState(v4());
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [waNo, setWaNo] = React.useState("");
    const [bio, setBio] = React.useState("");
    const [surveyDisabled, setSurveyDisabled] = React.useState(false);
    const [checked, setChecked] = React.useState(false);
    const [userAdded, setUserAdded] = React.useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const [qr, setQr] = React.useState("");
    const [qrIsAvailable, setQrIsAvailable] = React.useState(false);
    const [qrExpired, setQrExpired] = React.useState(false);

    const [WaitClientController, setWaitClientController] = React.useState(null);
    const [GenerateQRController, setGenerateQRController] = React.useState(null);

    const [qrModalOpen, setQRModalOpen] = React.useState(false);
    const [openPrompt, setOpenPrompt] = React.useState(false);

    const { setAuth, setPersist } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();

    const [pageLoading, setPageLoading] = React.useState(false);


    const renderTime = ({ remainingTime }) => {
        return (
            <div style={timerStyle}>
                <div style={textStyle}>Remaining</div>
                <div style={valueStyle}>{remainingTime}</div>
                <div style={textStyle}>seconds</div>
            </div>
        );
    };

    const validateFormSubmit = () => {

        if (
            username === "" ||
            name === "" ||
            password === "" ||
            waNo === "" ||
            email === "" ||
            address === "" ||
            bio === ""
        ) {
            enqueueSnackbar("Please fill all the fields", {
                autoHideDuration: 5000,
                variant: "error",
            });
            return false;
        }


        // check if username contains only alphanumeric characters
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
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

        // check if email is valid
        if (!/\S+@\S+\.\S+/.test(email)) {
            enqueueSnackbar("Please Enter a Valid Email", {
                autoHideDuration: 5000,
                variant: "error",
            });
            return false;
        }

        return true;

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

    const handleWaNoChange = (e) => {
        setWaNo(e.target.value);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = validateFormSubmit();
        if (!result) {
            return;
        }
        setUserAdded(false);
        const controller = new AbortController();
        const data = {
            user: username,
            name: name,
            password: password,
            contactInfo: {
                phoneNumber: waNo,
                email: email,
                address: address,
            },
            bio: bio,
            role: "individual",
            admin: "admin",
            surveyDisabled: true,
            signal: controller.signal,
            isIndividual: true,
        };
        axios
            .post("/register-surveyor", data)
            .then((res) => {
                enqueueSnackbar("User Registered Successfully!", {
                    autoHideDuration: 5000,
                    variant: "success",
                });
                setUserAdded(true);
                setOpenPrompt(true);
            })
            .catch((err) => {
                console.log(err);
                // Check if status code 409
                setUserAdded(false);
                if (err.response.status === 409) {
                    enqueueSnackbar("Username already exists!", {
                        autoHideDuration: 5000,
                        variant: "error",
                    });
                    return;
                } else {
                    navigate("/login", { state: { from: location }, replace: true });
                }
            })
            .finally(() => {
                controller.abort();
            });
    };

    const generateQR = () => {
        const result = validateFormSubmit();
        if (result) {
            setQRModalOpen(true);
        }
        else {
            return;
        }

        setQrExpired(false);
        setQrIsAvailable(false);

        const client_id = v4();
        setUserId(client_id);
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
                    setQRModalOpen(false);
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
            name: username,
            clientId: client_id,
            surveyor: username,
            signal: controller.signal,
            bio: bio,
            contactInfo: {
                phoneNumber: waNo,
                address: address,
                email: email,
            },
        };
        axios
            .post(
                "/waitForClient",
                { clientId: client_id, participant: newParticipant },
                { signal: controller.signal }
            )
            .then(function (response) {
                if (response.data === "Participant added") {
                    enqueueSnackbar("User Authenticated!", {
                        autoHideDuration: 5000,
                        variant: "success",
                    });
                    enqueueSnackbar("Redirecting to Dashboard", {
                        autoHideDuration: 5000,
                        variant: "info",
                    });
                    // navigate("/login");
                    setPageLoading(true);
                    handleLogin();
                } else if (response.data === "qr expired") {
                    setQrExpired(true);
                    setQrIsAvailable(false);
                    enqueueSnackbar("QR Code Expired", {
                        autoHideDuration: 5000,
                        variant: "error",
                    });
                }
                else if (response.data === "error adding user") {
                    enqueueSnackbar("Error authenticating user", {
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
                    setQRModalOpen(false);
                }
                setOpenPrompt(false);
            });
    };

    const handleLogin = async () => {
        try {
            const user = username;
            setPersist(true);
            localStorage.setItem("persist", true);
            const response = await axios.post(
                '/login',
                JSON.stringify({ user, password }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            const accessToken = response?.data?.accessToken;
            const role = response?.data?.role;
            const surveyDisabled = response?.data?.surveyDisabled;
            setAuth({ user, password, accessToken, role, surveyDisabled });
            navigate('/allUsers', { replace: true });
        } catch (error) {
            let errMsg;
            if (!error?.response) {
                errMsg = "Server error";
            } else if (error.response?.status === 400) {
                errMsg = "Missing credentials";
            } else if (error.response?.status === 401) {
                errMsg = "Unauthorized";
            } else {
                errMsg = "Login Failed";
            }
            enqueueSnackbar(errMsg, {
                autoHideDuration: 5000,
                variant: "error",
            });
        }
    }

    const handleCheckedChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleCloseQRModal = () => {
        setQRModalOpen(false);

        if (qrIsAvailable) {
            WaitClientController.abort();
            setQrIsAvailable(false);
            setQr("");
        } else {
            GenerateQRController.abort();
        }
    };
    const handleClosePrompt = () => setOpenPrompt(false);

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

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    if (pageLoading) {
        return <LoadingScreen />;
    }

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
                        name="waNo"
                        placeholder="WhatsApp Number*"
                        id="waNo"
                        onChange={handleWaNoChange}
                        value={waNo}
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
                    {/* <FormControl component="fieldset" sx={{ mt: "1rem" }}>
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
                    </FormControl> */}
                    <FormControlLabel
                        label="I agree to the Terms and Conditions"
                        control={<Checkbox checked={checked} onChange={handleCheckedChange} />}
                    />
                    <Button
                        disabled={!checked || userAdded}
                        sx={{ mt: "2rem" }}
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Register
                    </Button>
                </FormControl>
            </Box>
            <Modal
                open={qrModalOpen}
                onClose={handleCloseQRModal}
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
                            You will now be asked to scan the QR code from the user's phone.
                        </Typography>
                        <Typography variant="p">Follow the instructions below:</Typography>
                        <Typography variant="p" align="left">
                            1. Open WhatsApp on the user's phone.
                            <br />
                            2. Tap Menu <MoreVertIcon /> or Settings <SettingsIcon /> and
                            select <strong>Linked Devices</strong>.
                            <br />
                            3. Select Link a new device.
                            <br />
                            4. Press the button below to Generate QR Code.
                            <br />
                            5. Scan the QR code from the user's phone.
                            <br />
                        </Typography>
                        <Button onClick={generateQR}>Generate QR</Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
}

export default NewIndividual;
