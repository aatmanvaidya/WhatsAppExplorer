import * as React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { TableRow } from "@mui/material";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import PollIcon from '@mui/icons-material/Poll';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate, useLocation } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Modal from "@mui/material/Modal";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import useAuth from "../../hooks/useAuth";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingScreen from "./LoadingScreen";
import { useSnackbar } from "notistack";
import ProgressBar from "../Elements/ProgressBar";
import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import DeselectIcon from '@mui/icons-material/Deselect';
import { useTranslation } from 'react-i18next';

const ENDPOINT = "";

// var socket;
// socket = io(ENDPOINT);
// socket.on('message', (data) => console.log(data));
// console.log("blabla")
// import QRCode from 'qrcode';

// import { MdQrCodeScanner } from 'react-icons/md';
// import { QRCodeSVG } from 'qrcode.react';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#6666ff",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "theme.palette.action.hover",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(
  name,
  R_date,
  last_update,
  device_type,
  account_type,
  surveyor,
  protein,
  price
) {
  return {
    name,
    R_date,
    last_update,
    device_type,
    surveyor,
    protein,
    price,
    history: [
      {
        date: 213,
        customerId: 101,
        amount: 63,
        account_type: account_type,
      },
    ],
  };
}

function Row(props) {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    row,
    isConnected,
    setIsConnected,
    setParticipants,
    setPageLoading,
    setSnackOpen,
    handleCloseTutorial,
    handleOpenTutorial,
    clientStatus,
  } = props;
  const [connectionStatus, setConnectionStatus] = React.useState(false);
  // const [qrAvailable, setQrAvailable] = React.useState(false);
  const [qr, setQr] = React.useState("");
  const [msgSnackOpen, setmsgSnackOpen] = React.useState(false);
  const [contactSnackOpen, setcontactSnackOpen] = React.useState(false);
  const [chatSnackOpen, setchatSnackOpen] = React.useState(false);

  const [deletedRows, setDeletedRows] = React.useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [consentLoader, setConsentLoader] = useState(false);
  const [loaderMsg, setLoaderMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadUsers, setReloadUsers] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [chatUsers, setChatUsers] = useState([]);

  const [checked, setChecked] = React.useState({});
  const [unchecked, setUnchecked] = React.useState({});

  const [sortBy, setSortBy] = React.useState("Default");
  // Modal
  const [open, setOpen] = React.useState(false);
  const [progressOpen, setProgressOpen] = React.useState(false);

  // Status
  const [status, setStatus] = React.useState(clientStatus);

  // Deselect Clicked
  const [deselected, setDeselected] = React.useState(false);

  useEffect(() => {
    setStatus(clientStatus)
  }, [clientStatus]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSort = (event) => {
    setSortBy(event.target.value);
    let chat_users = [...chatUsers];
    if (event.target.value === "Message Count") {
      chat_users.sort(sortByMessageCount);
    } else if (event.target.value === "Recent Activity") {
      chat_users.sort(sortByRecentActivity);
    } else if (event.target.value === "Num Participants") {
      chat_users.sort(sortByNumParticipants);
    } else if (event.target.value === "Default") {
      let chat_users_dict = defaultChecked(chat_users);
      setUnchecked(chat_users_dict);
      setChecked(chat_users_dict);
      return;
    }

    setChatUsers(chat_users);
  };

  // const sortByDefault = (a, b) => {
  //   if (a.isGroup && b.isGroup) {
  //     if (checked[a.id._serialized] && !checked[b.id._serialized]) {
  //       return -1;
  //     }
  //     if (!checked[a.id._serialized] && checked[b.id._serialized]) {
  //       return 1;
  //     }
  //   }
  //   return 0;
  // };

  const sortByNumParticipants = (a, b) => {
    if (a.isGroup && b.isGroup) {
      return b.num_participants - a.num_participants;
    } else if (a.isGroup) {
      return -1;
    } else if (b.isGroup) {
      return 1;
    } else {
      return 0;
    }
  };

  const sortByMessageCount = (a, b) => {
    if (a.num_messages > b.num_messages) {
      return -1;
    }
    if (a.num_messages < b.num_messages) {
      return 1;
    }
    return 0;
  };
  const sortByRecentActivity = (a, b) => {
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    return 0;
  };

  const defaultChecked = (chat_users) => {
    let selected_users = [];
    // Select groups with participant count > 6
    for (let user of chat_users) {
      if (
        process.env.REACT_APP_INDIVIDUAL_CHAT === "true" ||
        (user.isGroup &&
          user.num_participants > 4 &&
          user.num_messages >= 15)
      ) {
        selected_users.push(user.id._serialized);
      }
    }

    // random select 20 users
    // if (selected_users.length > 20) {
    //   const shuffled = selected_users.sort(() => 0.5 - Math.random());
    //   selected_users = shuffled.slice(0, 20);
    // }

    const checked_dict = {};
    for (let key of chat_users) {
      checked_dict[key.id._serialized] = false;
    }

    for (let user of selected_users) {
      checked_dict[user] = true;
    }
    return checked_dict;
  };

  const deselectAll = () => {
    setDeselected(true);
    let checked_dict = {};
    let unchecked_dict = {};
    for (let key of chatUsers) {
      if (checked_dict[key.id._serialized] == true) {
        unchecked_dict[key.id._serialized] = true;
      } else {
        unchecked_dict[key.id._serialized] = false;
      }
      checked_dict[key.id._serialized] = false;
    }
    setUnchecked(unchecked_dict);
    setChecked(checked_dict);
  };

  useEffect(() => {
    const controller1 = new AbortController();
    const data = {
      clientId: row.clientId,
      signal: controller1.signal,
    };
    axiosPrivate
      .post("/consented-users", data)
      .then((res) => {
        // check if consenting first time
        if (res.data.length === 0) {
          let sampled_chat_users = defaultChecked(chatUsers);
          setChecked(sampled_chat_users);
          setUnchecked(sampled_chat_users);
        } else {
          let consented_users = {};
          for (let user of res.data) {
            consented_users[user[0]] = user[1];
          }
          let checked_dict = {};
          for (let key of chatUsers) {
            checked_dict[key.id._serialized] =
              consented_users[key.id._serialized] || false;
          }
          setChecked(checked_dict);
          setUnchecked(checked_dict);
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .finally(() => {
        controller1.abort();
      });
  }, [chatUsers]);

  const handleChange = (event, id) => {
    setChecked({ ...checked, [id]: event.target.checked });
  };

  const removeByAttr = (arr, attr, value) => {
    var i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  };

  // passing the client id
  async function connectUser(clientName) {
    setLoading(true);
    handleCloseTutorial();
    axios
      .post("/authUser", { clientId: clientName })
      .then(function (response) {
        const status = response.data;
        if (status === "busy") {
          enqueueSnackbar("User is busy!", {
            autoHideDuration: 5000,
            variant: "error",
          });
        } else if (status === "qr") {
          enqueueSnackbar("User credentials revoked!", {
            autoHideDuration: 5000,
            variant: "error",
          });
        } else if (status === "authenticated") {
          setConnectionStatus(true);
          setStatus("CONNECTED");
          enqueueSnackbar("User connected!", {
            autoHideDuration: 5000,
            variant: "success",
          });
          handleOpenTutorial();
        } else if (status === "auth_failure") {
          enqueueSnackbar("Authentication Failure", {
            autoHideDuration: 5000,
            variant: "error",
          });
        } else {
          enqueueSnackbar("User not found!", {
            autoHideDuration: 5000,
            variant: "error",
          });
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
        setLoading(false);
      });
  }

  const disconnectUser = (clientId) => {
    setConnectionStatus(false);
    setIsConnected(false);
  };

  const logContacts = (userId, userName, participantId) => {
    // setLoadingContacts(true);
    const controller = new AbortController();
    const data = {
      clientId: userId,
      clientName: userName,
      participantId: participantId,
      signal: controller.signal,
    };
    let isMounted = true;
    axiosPrivate
      .post("/all-contacts", data)
      .then(function (response) {
        if (response.data == "busy") {
          enqueueSnackbar("User is busy!", {
            autoHideDuration: 6000,
            variant: "error",
          });
        }
        // handle success
        // setConnectionStatus(!connectionStatus);
        // setcontactSnackOpen(true);
        enqueueSnackbar("Contact Logs Updated!", {
          autoHideDuration: 3000,
          variant: "success",
        });
        // setLoadingContacts(false);
        isMounted && console.log(response);
        setConsentLoader(false);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .finally(function () {
        isMounted = false;
        controller.abort();
      });
  };

  const logChatUsers = (userId, userName, participantId) => {
    // setLoadingChats(true);
    setConsentLoader(true);
    setLoaderMsg("Logging Chat Users...");
    const controller = new AbortController();
    const data = {
      clientId: userId,
      clientName: userName,
      participantId: participantId,
      signal: controller.signal,
    };
    let isMounted = true;
    axiosPrivate
      .post("/getChatUsers", data)
      .then(function (response) {
        // handle success
        // setchatSnackOpen(true);
        enqueueSnackbar("Chat Logs Loaded!", {
          autoHideDuration: 3000,
          variant: "success",
        });
        // console.log(response.data);
        // setConnectionStatus(!connectionStatus);
        let chat_users = response.data.chats;
        // chat_users.sort(sortByDefault);
        setLoadingChats(false);
        isMounted && setChatUsers(chat_users);

        setLoaderMsg("Logging Contacts...");
        logContacts(userId, userName, participantId);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .finally(function () {
        isMounted = false;
        controller.abort();
      });
  };

  const openConsentPage = () => {
    handleOpen();
    handleCloseTutorial();
    if (!loadingChats) {
      setLoadingChats(true);
      logChatUsers(row.clientId, row.name, row._id);
    }
  };

  // from consented chats, log all messages
  const logConsentedMessages = (userId, userName, participantId, surveyDisabled) => {
    // setLoadingMessages(true);
    setConsentLoader(true);
    setLoaderMsg("Logging Messages...");
    let consented_chats = [];
    for (let key in checked) {
      consented_chats.push([key, checked[key]]);
    }

    let changed_consent = [];
    let given_consent = [];
    for (let key in checked) {
      if (checked[key] == false && unchecked[key] == true) {
        changed_consent.push(key);
      }
      if (checked[key] == true) {
        given_consent.push(key);
      }
    }

    setConsentLoader(false);
    setConnectionStatus(false);
    setIsConnected(false);
    setProgressOpen(true);
    handleClose();

    function getRandomChats(arr, numValues) {
      if (numValues >= arr.length) {
        return arr;
      }

      const shuffledArr = arr.slice(); // Create a copy of the original array
      for (let i = shuffledArr.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledArr[i], shuffledArr[randomIndex]] = [shuffledArr[randomIndex], shuffledArr[i]];
      }

      return shuffledArr.slice(0, numValues);
    }

    const controller = new AbortController();
    const data = {
      clientId: userId,
      clientName: userName,
      consentedChats: consented_chats,
      participantId: participantId,
      signal: controller.signal,
      unchecked_chatids: changed_consent,
      checked_chatids: given_consent,
      deselectedChats: deselected,
    };
    // console.log(data);
    let isMounted = true;
    axiosPrivate
      .post("/consented-chats", data)
      .then(function (response) {
        if (response.data === "busy") {
          enqueueSnackbar("User is busy!", {
            autoHideDuration: 6000,
            variant: "error",
          });
        } else {
          // handle success
          // setmsgSnackOpen(true);
          enqueueSnackbar("Message Logs Updated!", {
            autoHideDuration: 3000,
            variant: "success",
          });
          console.log(response.data);
          const checkedUsers = response.data.checked;
          const uncheckedUsers = response.data.unchecked;

          const randomCheckedUsers = getRandomChats(checkedUsers, 5);
          const randomUncheckedUsers = getRandomChats(uncheckedUsers, 5);
          if ((checkedUsers.length > 0 || uncheckedUsers.length > 0) && !surveyDisabled) {
            console.log("redirecting to survey form");
            navigate("/survey-form", {
              state: { from: location, clientName: data.clientName, clientId: data.clientId, checkedUsers: randomCheckedUsers, uncheckedUsers: randomUncheckedUsers, formType: 1 },
            });
          }
        }

        setProgressOpen(false);
        // setLoadingMessages(false);
        // setConnectionStatus(!connectionStatus);
        isMounted && console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
        setLoaderMsg("Error Logging Messages");
        setConsentLoader(false);
        handleClose();
      })
      .finally(function () {
        isMounted = false;
        controller.abort();
      });
  };

  const contactSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setcontactSnackOpen(false);
  };

  const msgSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setmsgSnackOpen(false);
  };

  const chatSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setchatSnackOpen(false);
  };

  const deleteSnackOpenHandler = (userId, name) => {
    // console.log(userId);
    // take confirmation from user
    const isDelete = window.confirm(`Do you want to delete participant ${name}?`);
    if (!isDelete) {
      return;
    }
    setIsDeleting(true);
    const controller = new AbortController();
    axiosPrivate
      .post(`/removeParticipant/${userId}`, { signal: controller.signal })
      .then(function (response) {
        // handle success
        // setConnectionStatus(!connectionStatus);
        // console.log(response);
        setParticipants((prev) =>
          prev.filter((participant) => participant.clientId !== userId)
        );
        setIsDeleting(false);
        enqueueSnackbar("User credentials deleted!", {
          autoHideDuration: 3000,
          variant: "success",
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .then(function () {
        // always executed
        controller.abort();
        // window.location.reload(false);
      });
  };

  const refreshChatUsers = (clientId, clientName) => {
    setReloadUsers(true);
    const controller = new AbortController();
    const data = {
      clientId: clientId,
      clientName: clientName,
      signal: controller.signal,
    };
    axiosPrivate
      .post("/all-chatName", data)
      .then(function (response) {
        // handle success
        // setConnectionStatus(!connectionStatus);
        let chat_users = response.data.chats;
        // chat_users.sort(sortByDefault);
        setChatUsers(chat_users);
        setReloadUsers(false);
        enqueueSnackbar("Chat Users reloaded successfully!", {
          autoHideDuration: 3000,
          variant: "success",
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .finally(() => {
        controller.abort();
      });
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

  return (
    <>
      <StyledTableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <StyledTableCell align="center" component="th" scope="row">
          {row.name}
        </StyledTableCell>
        <StyledTableCell align="center">
          {row.dateOfRegistration}
        </StyledTableCell>
        <StyledTableCell align="center">{row.addedByName}</StyledTableCell>
        <StyledTableCell align="center">
          {
            <Typography variant="h6" gutterBottom component="div">
              {loading ? <LinearProgress /> : <></>}
              {connectionStatus ? (
                <Button
                  sx={{
                    marginLeft: 1,
                    marginTop: 2,
                  }}
                  onClick={() => disconnectUser(row.clientId)}
                  color="error"
                >
                  {t('disconnect')}
                </Button>
              ) : (
                <Button
                  sx={{
                    marginLeft: 1,
                    zIndex: (theme) => theme.zIndex.drawer + 2,
                    backgroundColor: '#fff',
                  }}
                  onClick={() => connectUser(row.clientId)}
                  disabled={isConnected || loading || connectionStatus || (clientStatus !== "CONNECTED" && clientStatus !== "DISCONNECTED")}
                >
                  {t('connect')}
                </Button>
              )}
            </Typography>
          }
        </StyledTableCell>
        {/* <StyledTableCell align="center">
          {loadingContacts ? <LinearProgress /> : <></>}
          {
            <Button
              sx={{
                marginRight: 0,
              }}
              onClick={() => logContacts(row.clientId, row.name, row._id)}
              disabled={!connectionStatus}
            >
              Update Contact Logs
            </Button>
          }
        </StyledTableCell>
        <StyledTableCell align="center">
          {loadingChats ? <LinearProgress /> : <></>}
          {
            <Button
              sx={{
                marginRight: 0,
              }}
              onClick={() => logChatUsers(row.clientId, row.name, row._id)}
              disabled={!connectionStatus}
            >
              Update Chat User Logs
            </Button>
          }
        </StyledTableCell> */}
        <StyledTableCell align="center">{t(status.replace(/ /g,"_"))}</StyledTableCell>
        <StyledTableCell align="center">
          {loadingMessages ? <LinearProgress /> : <></>}
          {
            <Button
              sx={{
                marginRight: 0,
                zIndex: (theme) => theme.zIndex.drawer + 4,
                backgroundColor: '#fff',
              }}
              onClick={openConsentPage}
              disabled={!connectionStatus}
            >
              {t('chooseThreadsToShare')}
            </Button>
          }
        </StyledTableCell>
        <StyledTableCell align="center">
          {isDeleting ? (
            <CircularProgress />
          ) : (
            <DeleteOutlineIcon
              color="error"
              onClick={() => deleteSnackOpenHandler(row.clientId, row.name)}
              sx={{ cursor: "pointer" }}
            />
          )}
        </StyledTableCell>
      </StyledTableRow>
      <Snackbar
        open={contactSnackOpen}
        autoHideDuration={3000}
        onClose={contactSnackClose}
        sx={{ bottom: 10 }}
      >
        <Alert
          onClose={contactSnackClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Contact Logs Updated!
        </Alert>
      </Snackbar>
      <Snackbar
        open={chatSnackOpen}
        autoHideDuration={3000}
        onClose={chatSnackClose}
      >
        <Alert
          onClose={chatSnackClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Chat Logs Updated!
        </Alert>
      </Snackbar>
      <Snackbar
        open={msgSnackOpen}
        autoHideDuration={3000}
        onClose={msgSnackClose}
      >
        <Alert
          onClose={msgSnackClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Message Logs Updated!
        </Alert>
      </Snackbar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            {consentLoader ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Stack spacing={2}>
                  <Typography variant="p" component="div" mb={"1rem"}>
                    {loaderMsg}
                  </Typography>
                  <CircularProgress size="5rem" sx={{ marginBottom: "2rem" }} />
                </Stack>
              </Box>
            ) : (
              <Stack spacing={2} direction="row">
                {process.env.REACT_APP_INDIVIDUAL_CHAT === "true" ?
                  <Box sx={{ height: "50vh", overflowY: "auto", width: "35vw" }}>
                    <Typography variant="h6" component="div" mb={"1rem"}>
                      Individual Chats
                    </Typography>
                    {chatUsers.map((chat) => {
                      if (chat.isGroup === false) {
                        return (
                          <Typography
                            id="modal-modal-description"
                            component="p"
                            key={chat.id._serialized}
                          >
                            <FormControlLabel
                              label={chat.name + " : " + chat.num_messages}
                              control={
                                <Checkbox
                                  checked={checked[chat.id._serialized]}
                                  onChange={(event) =>
                                    handleChange(event, chat.id._serialized)
                                  }
                                />
                              }
                            />
                          </Typography>
                        );
                      } else {
                        return <></>;
                      }
                    })}
                  </Box> :
                  null
                }
                <Box sx={{ height: "50vh", overflowY: "auto", width: "40vw" }}>
                  <Typography variant="h6" component="div" mb={"1rem"}>
                    Groups
                  </Typography>
                  {chatUsers.map((chat) => {
                    if (chat.isGroup && unchecked[chat.id._serialized]) {
                      return (
                        <Typography
                          id="modal-modal-description"
                          component="p"
                          key={chat.id._serialized}
                        >
                          <FormControlLabel
                            disabled={process.env.REACT_APP_INDIVIDUAL_CHAT !== "true" && (chat.num_participants < 5 || chat.num_messages < 15) }
                            label={
                              chat.name +
                              " (" +
                              chat.num_participants +
                              ") : " +
                              chat.num_messages
                            }
                            control={
                              <Checkbox
                                checked={checked[chat.id._serialized]}
                                onChange={(event) =>
                                  handleChange(event, chat.id._serialized)
                                }
                              />
                            }
                          />
                        </Typography>
                      );
                    } else {
                      return <></>;
                    }
                  })}
                  {chatUsers.map((chat) => {
                    if (chat.isGroup && !unchecked[chat.id._serialized]) {
                      return (
                        <Typography
                          id="modal-modal-description"
                          component="p"
                          key={chat.id._serialized}
                        >
                          <FormControlLabel
                            disabled={process.env.REACT_APP_INDIVIDUAL_CHAT !== "true" && (chat.num_participants < 5 || chat.num_messages < 15) }
                            label={
                              chat.name +
                              " (" +
                              chat.num_participants +
                              ") : " +
                              chat.num_messages
                            }
                            control={
                              <Checkbox
                                checked={checked[chat.id._serialized]}
                                onChange={(event) =>
                                  handleChange(event, chat.id._serialized)
                                }
                              />
                            }
                          />
                        </Typography>
                      );
                    } else {
                      return <></>;
                    }
                  })}
                </Box>
              </Stack>
            )}
            <Stack direction="row" spacing={2}>
              {consentLoader ? (
                null
              ) : (
                <IconButton
                  color="primary"
                  onClick={deselectAll}
                >
                  <DeselectIcon />
                </IconButton>
              )}
              <Button
                onClick={() =>
                  logConsentedMessages(row.clientId, row.name, row._id, row.surveyDisabled)
                }
                color="primary"
                variant="contained"
              >
                Log Messages
              </Button>
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSort}
                  >
                    <MenuItem value={"Default"}>Default</MenuItem>
                    <MenuItem value={"Message Count"}>Message Count</MenuItem>
                    <MenuItem value={"Recent Activity"}>
                      Recent Activity
                    </MenuItem>
                    <MenuItem value={"Num Participants"}>
                      Num Participants
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {reloadUsers ? (
                <CircularProgress />
              ) : (
                <IconButton
                  color="primary"
                  onClick={() => refreshChatUsers(row.clientId, row.name)}
                >
                  <RefreshIcon />
                </IconButton>
              )}
              {/* {
                <Button
                  sx={{
                    marginRight: 0,
                  }}
                  onClick={openConsentPage}
                  disabled={!connectionStatus}
                >
                  <Tooltip title="User Survey">
                    <PollIcon
                      color="primary"
                      sx={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                </Button>

              } */}
            </Stack>
          </Stack>
        </Box>
      </Modal>
      <ProgressBar
        open={progressOpen}
        setOpen={setProgressOpen}
        message={"Logging messages..."}
      />
    </>
  );
}

export default function AllUsers() {
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [updateRows, setUpdateRows] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState(false);
  const [qrAvailable, setQrAvailable] = React.useState(false);
  const [qr, setQr] = React.useState("");

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [msgSnackOpen, setmsgSnackOpen] = React.useState(false);
  const [contactSnackOpen, setcontactSnackOpen] = React.useState(false);
  const [chatSnackOpen, setchatSnackOpen] = React.useState(false);

  const [deletedRows, setDeletedRows] = React.useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [openTutorial, setOpenTutorial] = React.useState(false);
  const [tutorialIdx, setTutorialIdx] = React.useState(0);

  const [statusDict, setStatusDict] = React.useState({});

  const { auth } = useAuth();

  // let logInfo = sessionStorage.getItem("logInfo");

  // console.log(logInfo);

  // async function connectUser(clientName) {
  //     console.log(clientName);
  //     // console.log(connectionStatus);
  //     setLoading(true);

  //     // axios.get('/getUser')
  //     //     .then(res => console.log(res))
  //     //     .catch(function (error) {
  //     //         // handle error
  //     //         console.log(error);
  //     //     })
  //     //     .then(function () {
  //     //         // always executed
  //     //     });

  //     // console.log(loading);
  //     let interval = setInterval(function () {

  //         axios.get('/getClientState')
  //             .then(res => {
  //                 console.log(res.data);
  //                 if (res.data == "CONNECTED") {
  //                     clearInterval(interval);
  //                     setLoading(false);
  //                     setConnectionStatus(true);
  //                 }
  //             })
  //             .catch(function (error) {
  //                 // handle error
  //                 console.log(error);
  //             })
  //             .then(function () {
  //                 // always executed
  //             });
  //         // }, 15000);

  //     }, 10000);

  //     axios.post('/authUser', { clientName: clientName })
  //         .then(function (response) {
  //             // handle success
  //             setConnectionStatus(!connectionStatus);
  //             console.log(response.data);
  //             setQrAvailable(true);
  //             setQr(response.data)
  //         })
  //         .catch(function (error) {
  //             // handle error
  //             console.log(error);
  //         })
  //         .then(function () {
  //             // always executed
  //         });

  // }

  // //yet to be implemented
  // const disconnectUser = (clientName) => {
  //     console.log(clientName);

  //     setConnectionStatus(false);

  //     // axios.post('/authUser', { clientName: clientName })
  //     //     .then(function (response) {
  //     //         // handle success
  //     //         setConnectionStatus(!connectionStatus);
  //     //         console.log(response);
  //     //     })
  //     //     .catch(function (error) {
  //     //         // handle error
  //     //         console.log(error);
  //     //     })
  //     //     .then(function () {
  //     //         // always executed
  //     //     });

  // }

  // const logContacts = () => {
  //     setcontactSnackOpen(true);
  //     axios.post('/all-contacts')
  //         .then(function (response) {
  //             // handle success
  //             // setConnectionStatus(!connectionStatus);
  //             console.log(response);
  //         })
  //         .catch(function (error) {
  //             // handle error
  //             console.log(error);
  //         })
  //         .then(function () {
  //             // always executed
  //         });
  // }

  // const logChatUsers = () => {
  //     setchatSnackOpen(true);
  //     axios.post('/all-chatName')
  //         .then(function (response) {
  //             // handle success
  //             // setConnectionStatus(!connectionStatus);
  //             console.log(response);
  //         })
  //         .catch(function (error) {
  //             // handle error
  //             console.log(error);
  //         })
  //         .then(function () {
  //             // always executed
  //         });
  // }

  // //from all chats, log all messages
  // const logMessages = () => {
  //     setmsgSnackOpen(true);
  //     axios.post('/all-chats')
  //         .then(function (response) {
  //             // handle success
  //             // setConnectionStatus(!connectionStatus);
  //             console.log(response);
  //         })
  //         .catch(function (error) {
  //             // handle error
  //             console.log(error);
  //         })
  //         .then(function () {
  //             // always executed
  //         });
  // }

  const SnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };

  // const contactSnackClose = (event, reason) => {
  //     if (reason === 'clickaway') {
  //         return;
  //     }

  //     setcontactSnackOpen(false);
  // };

  // const msgSnackClose = (event, reason) => {
  //     if (reason === 'clickaway') {
  //         return;
  //     }

  //     setmsgSnackOpen(false);
  // };

  // const chatSnackClose = (event, reason) => {
  //     if (reason === 'clickaway') {
  //         return;
  //     }

  //     setchatSnackOpen(false);
  // };

  // const removeByAttr = (arr, attr, value) => {

  //     var i = arr.length;
  //     while (i--) {
  //         if (arr[i]
  //             && arr[i].hasOwnProperty(attr)
  //             && (arguments.length > 2 && arr[i][attr] === value)) {

  //             arr.splice(i, 1);
  //         }
  //     }
  //     return arr;
  // }

  // const deleteSnackOpenHandler = (userId) => {

  //     setParticipants([]);
  //     setSnackOpen(true);

  // };

  let showTutorial = localStorage.getItem("showTutorial");
  if (auth.role === "individual") {
    if (showTutorial === null) {
      showTutorial = true;
    }
  } else {
    showTutorial = false;
  }
  const handleCloseTutorial = () => {
    setOpenTutorial(false);
    setTutorialIdx(tutorialIdx + 1);
    if (auth.role === "individual") {
      localStorage.setItem("showTutorial", false);
    }
  };
  const handleOpenTutorial = () => {
    if (auth.role === "individual") {
      setOpenTutorial(true);
    }
  };

  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();

  let timer;
  const updateClientStatus2 = () => {
    const controller = new AbortController();
    let isMounted = true;
    const data = {
      role: auth.role,
      username: auth.user,
      signal: controller.signal,
    };
    axiosPrivate
      .post("/getClientStatus2", data)
      .then((res) => {
        isMounted && setStatusDict(res.data);
        timer = setTimeout(updateClientStatus2, 20000);
      })
      .catch((err) => {
        console.log(err);
        console.log("removing timer", timer);
        clearTimeout(timer);
      })
      .finally(() => {
        isMounted = false;
        controller.abort();
      });
  };


  useEffect(() => {
    const controller = new AbortController();
    const data = {
      username: auth.user,
      role: auth.role,
      signal: controller.signal,
    };
    // console.log(data);
    let isMounted = true;
    axiosPrivate
      .post("/getParticipants", data)
      .then(function (response) {
        isMounted && setParticipants(response.data);
        updateClientStatus2();
        // setParticipants(rows);
        // console.log(response.data);
        if (showTutorial === true)
          handleOpenTutorial();
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .then(function () {
        // always executed
        setPageLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };

    // console.log(participants);
  }, [updateRows]);

  if (pageLoading) {
    return <LoadingScreen />;
  }

  const tutorialData = [
    "Press the Connect User Button to connect to your account for the first time.",
    "Select Choose Threads to Share to consent chats for collecting data.",
    "",
  ]

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 + 2 * tutorialIdx }}
        open={openTutorial}
      // onClick={handleCloseTutorial}
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={10}
        >
          <ArrowUpwardIcon
            sx={{
              fontSize: 80,
              color: "black"
            }}
          />
          <Typography variant="h5" component="div" mb={"1rem"}>
            {tutorialData[tutorialIdx]}
          </Typography>
        </Stack>
      </Backdrop>

      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                UserId
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Registered Date
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Surveyor
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Connection
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Status
              </StyledTableCell>
              {/* <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              ChatLog
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              MsgLog
            </StyledTableCell> */}
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Action
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
                Action
              </StyledTableCell>
              {/* <StyledTableCell align="center" sx={{ fontWeight: 800 }}>Carbs&nbsp;(g)</StyledTableCell> */}
              {/* <StyledTableCell align="center" sx={{ fontWeight: 800 }}>Protein&nbsp;(g)</StyledTableCell> */}
              <StyledTableCell align="center" sx={{ fontWeight: 800 }} />
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {participants.map((row) => (
              <Row
                key={row.name}
                row={row}
                isConnected={isConnected}
                setIsConnected={setIsConnected}
                setParticipants={setParticipants}
                setPageLoading={setPageLoading}
                setSnackOpen={setSnackOpen}
                handleCloseTutorial={handleCloseTutorial}
                handleOpenTutorial={handleOpenTutorial}
                clientStatus={statusDict[row.clientId] || "-"}
              />
            ))}
          </TableBody>
        </Table>
        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={SnackClose}>
          <Alert onClose={SnackClose} severity="success" sx={{ width: "100%" }}>
            User credentials deleted!
          </Alert>
        </Snackbar>
        {/* 
            <Snackbar open={contactSnackOpen} autoHideDuration={3000} onClose={contactSnackClose}>
                <Alert onClose={contactSnackClose} severity="success" sx={{ width: '100%' }}>
                    Contact Logs Updated!
                </Alert>
            </Snackbar>
            <Snackbar open={chatSnackOpen} autoHideDuration={3000} onClose={chatSnackClose}>
                <Alert onClose={chatSnackClose} severity="success" sx={{ width: '100%' }}>
                    Chat Logs Updated!
                </Alert>
            </Snackbar>
            <Snackbar open={msgSnackOpen} autoHideDuration={3000} onClose={msgSnackClose}>
                <Alert onClose={msgSnackClose} severity="success" sx={{ width: '100%' }}>
                    Message Logs Updated!
                </Alert>
            </Snackbar> */}
      </TableContainer>
    </>
  );
}
