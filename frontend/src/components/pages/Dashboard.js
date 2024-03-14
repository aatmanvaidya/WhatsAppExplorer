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
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import useAuth from "../../hooks/useAuth";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingScreen from "./LoadingScreen";
// import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import ProgressBar from "../Elements/ProgressBar";
import { useTranslation } from 'react-i18next';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const modalStyle = {
  maxHeight: "55vh",
  width: "35vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  padding: "20px",
};

const modalStyleSmall = {
  maxHeight: "55vh",
  width: "90vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  padding: "20px",
};

export default function Dashboard() {
  const [dashboardInfo, setDashboardInfo] = useState({});
  const [selectedRow, setSelectedRow] = useState("");
  const [consentedUsers, setConsentedUsers] = useState([]);
  const [checked, setChecked] = useState({});
  const [chatUsers, setChatUsers] = useState([]);
  const [sortBy, setSortBy] = useState("Message Count");
  const [consentLoader, setConsentLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // const [qrAvailable, setQrAvailable] = useState(false);
  const [qr, setQr] = useState("");
  const [open, setOpen] = useState(false);
  const [refreshSnack, setRefreshSnack] = useState(false);
  const [refreshSnackBusy, setRefreshSnackBusy] = useState(false);
  const [revokedSnack, setRevokedSnack] = useState(false);
  const [noParticipantSnack, setNoParticipantSnack] = useState(false);
  const [loggingData, setLoggingData] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const myInterval = useRef(null);
  const [reload, setReload] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleCloseRefresh = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setRefreshSnack(false);
  };

  const handleCloseRefreshBusy = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setRefreshSnackBusy(false);
  };

  const handleCloseRevokedSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setRevokedSnack(false);
  };

  const handleCloseNoParticipantSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setNoParticipantSnack(false);
  };

  // passing the client id
  async function connectUser(clientName) {
    setLoading(true);
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
          // setConnectionStatus(true);
          setIsConnected(true);
          enqueueSnackbar("User connected!", {
            autoHideDuration: 5000,
            variant: "success",
          });
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

  const handleSort = (event) => {
    setSortBy(event.target.value);
    let chat_users = [...chatUsers];
    if (event.target.value === "Message Count") {
      chat_users.sort(sortByMessageCount);
    } else if (event.target.value === "Recent Activity") {
      chat_users.sort(sortByRecentActivity);
    } else if (event.target.value === "Num Participants") {
      chat_users.sort(sortByNumParticipants);
    }

    setChatUsers(chat_users);
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

  const sortByNumParticipants = (a, b) => {
    if (a.isGroup && b.isGroup) {
      return (
        b.num_participants -
        a.num_participants
      );
    } else if (a.isGroup) {
      return -1;
    } else if (b.isGroup) {
      return 1;
    } else {
      return 0;
    }
  };

  const getConsentedChatUsers = (clientId, clientName) => {
    setConsentLoader(true);
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const data = {
      clientId: clientId,
      signal: controller1.signal,
    };
    axiosPrivate
      .post("/consented-users", data)
      .then((res) => {
        // console.log(res.data);
        setConsentedUsers(res.data);
        let checked_dict = {};
        for (let user of res.data) {
          checked_dict[user[0]] = user[1];
        }
        setChecked(checked_dict);
        const data2 = {
          clientId: clientId,
          signal: controller2.signal,
        };
        axiosPrivate
          .post("/getChatUsers", data2)
          .then(function (response) {
            // handle success
            // setConnectionStatus(!connectionStatus);
            let chat_users = response.data.chats;
            chat_users.sort((a, b) => {
              if (a.num_messages > b.num_messages) {
                return -1;
              }
              if (a.num_messages < b.num_messages) {
                return 1;
              }
              return 0;
            });
            setChatUsers(chat_users);
            setConsentLoader(false);
          })
          .catch(function (error) {
            // handle error
            console.log(error);
            navigate("/login", { state: { from: location }, replace: true });
          });
      })
      .catch((err) => {
        setNoParticipantSnack(true);
        setConsentLoader(false);
      })
      .finally(() => {
        controller1.abort();
        controller2.abort();
      });
  };

  const refreshChatUsers = (clientId, clientName) => {
    setConsentLoader(true);
    const controller = new AbortController();
    const data = {
      clientId: clientId,
      clientName: clientName,
      signal: controller.signal,
    };
    axiosPrivate
      .post("/all-chatName", data)
      .then(function (response) {
        if (response.data === "busy") {
          setRefreshSnackBusy(true);
          setConsentLoader(false);
          return;
        }

        // handle success
        // setConnectionStatus(!connectionStatus);
        let chat_users = response.data.chats;
        chat_users.sort((a, b) => {
          if (a.num_messages > b.num_messages) {
            return -1;
          }
          if (a.num_messages < b.num_messages) {
            return 1;
          }
          return 0;
        });
        setChatUsers(chat_users);
        setConsentLoader(false);
        setRefreshSnack(true);
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

  const getMessageInfo = () => {
    const controller = new AbortController();
    const data = {
      role: auth.role,
      username: auth.user,
      signal: controller.signal,
    };
    axiosPrivate
      .post("/dashboard-info", data)
      .then(function (response) {
        // handle success
        // setConnectionStatus(!connectionStatus);
        setDashboardInfo(response.data);
        setPageLoading(false);
        // console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
        controller.abort();
      });
  };

  // from consented chats, log all messages
  const logConsentedMessages = async (userId, userName) => {
    // setPageLoading(true);
    setLoggingData(true);
    const res = await axios.post("/get-pid", { clientId: userId });
    const participantId = res.data.participantId;

    let consented_chats = [];
    for (let key in checked) {
      consented_chats.push([key, checked[key]]);
    }
    const controller = new AbortController();
    const data = {
      clientId: userId,
      clientName: userName,
      consentedChats: consented_chats,
      participantId: participantId,
      signal: controller.signal,
    };
    // console.log(data);
    axiosPrivate
      .post("/consented-chats", data)
      .then(function (response) {
        if (response.data === "busy") {
          setRefreshSnackBusy(true);
        } else {
          setOpen(true);
        }
        setLoggingData(false);
        setIsConnected(false);
        //reload data after 2 seconds
        setReload(true);
        // console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
        controller.abort();
      });
  };

  const handleChange = (event, id) => {
    setChecked({ ...checked, [id]: event.target.checked });
  };

  const detailed_info = (key, Style) => {
    if (key === "") {
      return;
    }
    return (
      <React.Fragment>
        <CardContent>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Box>
              <Typography color="text.secondary" gutterBottom>
                Detailed Info
              </Typography>
              <Typography variant="h6" component="div">
                User Name :
              </Typography>
              <Typography variant="body1" component="div">
                {dashboardInfo[key].userName}
              </Typography>
              <Typography variant="h6" component="div">
                Top 5 consented chat users :
              </Typography>
              {dashboardInfo[key].top_chats.map((chat, idx) => (
                <Typography variant="body1" component="div" key={idx}>
                  {idx + 1}. {chat[0]} : {chat[1]}
                </Typography>
              ))}
            </Box>
            <Box>
              <Typography variant="h6" component="div">
                <Box>{loading ? <LinearProgress /> : <></>}</Box>
                <Button
                  onClick={() => connectUser(key)}
                  disabled={isConnected}
                  color="primary"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  {t('connect')}
                </Button>
              </Typography>
            </Box>
          </Stack>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Consented Chat Users:
            <IconButton
              color="primary"
              onClick={() => refreshChatUsers(key, dashboardInfo[key].userName)}
              disabled={!isConnected}
            >
              <RefreshIcon />
            </IconButton>
          </Typography>
          <Box sx={Style}>
            <Stack spacing={2}>
              {consentLoader ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              ) : (
                <Stack spacing={2} direction="row">
                  {process.env.REACT_APP_INDIVIDUAL_CHAT === "true" ?
                    <Box sx={{ height: "40vh", overflowY: "auto", width: "45%" }}>
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
                  <Box sx={{ height: "40vh", overflowY: "auto", width: "55%" }}>
                    <Typography variant="h6" component="div" mb={"1rem"}>
                      Groups
                    </Typography>
                    {chatUsers.map((chat) => {
                      if (chat.isGroup) {
                        return (
                          <Typography
                            id="modal-modal-description"
                            component="p"
                            key={chat.id._serialized}
                          >
                            <FormControlLabel

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
                <Button
                  onClick={() =>
                    logConsentedMessages(key, dashboardInfo[key].userName)
                  }
                  disabled={!isConnected}
                  color="primary"
                  variant="contained"
                >
                  Log Messages
                </Button>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Sort By
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={sortBy}
                      label="Sort By"
                      onChange={handleSort}
                    >
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
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </React.Fragment>
    );
  };

  function truncateString(str, num) {
    // if str is undefined or null, return empty string
    if (str === null || str === undefined) {
      return "-";
    }

    if (str.length > num) {
      return str.slice(0, num) + "...";
    } else {
      return str;
    }
  }

  const table = (
    <React.Fragment>
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center" colSpan={3}>
                  Messages
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Contacts
                </TableCell>
                <TableCell align="center">Chat Users</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="right">Messages Logged</TableCell>
                <TableCell width="10%" align="right">
                  Last Update Time
                </TableCell>
                <TableCell width="20%" align="right">
                  Last Message
                </TableCell>
                <TableCell align="right">Contacts Logged</TableCell>
                <TableCell width="10%" align="right">
                  Last Update Time
                </TableCell>
                <TableCell align="right">Chat Users Logged</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(dashboardInfo).map((key) => (
                <TableRow
                  onClick={() => setSelectedRow(key)}
                  key={key}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { cursor: "pointer" },
                  }}
                >
                  <TableCell width="15%" component="th" scope="row">
                    {dashboardInfo[key].userName || "-"}
                  </TableCell>
                  <TableCell width="15%" align="right">
                    {dashboardInfo[key].no_of_msgs_logged || "-"}
                  </TableCell>
                  <TableCell width="10%" align="right">
                    {truncateString(dashboardInfo[key].last_upd_time, 10) ||
                      "-"}
                  </TableCell>
                  <TableCell width="20%" align="right">
                    {truncateString(
                      dashboardInfo[key].last_actual_message_logged?.type == "revoked" ? "Deleted Message" :
                        dashboardInfo[key].last_actual_message_logged?.hasMedia == true ? "MEDIA" :
                          dashboardInfo[key].last_actual_message_logged?.body,
                      30
                    )}
                  </TableCell>
                  <TableCell width="15%" align="right">
                    {dashboardInfo[key].no_of_contacts || "-"}
                  </TableCell>
                  <TableCell width="10%" align="right">
                    {truncateString(
                      dashboardInfo[key].last_contact_upd_time,
                      10
                    ) || "-"}
                  </TableCell>
                  <TableCell width="15%" align="right">
                    {dashboardInfo[key].no_of_chat_users || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </React.Fragment>
  );

  useEffect(() => {
    if (reload) {
      getMessageInfo();
      setReload(false);
    }
  }, [reload]);

  useEffect(() => {
    if (selectedRow !== "") {
      // setQrAvailable(false);
      setIsConnected(false);
      setChatUsers([]);
      setSortBy("Message Count");
      setChecked({});
      getConsentedChatUsers(selectedRow, dashboardInfo[selectedRow].userName);
    }
  }, [selectedRow]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  // useEffect(() => {
  //   console.log(checked);
  //   for(let key in checked){
  //     if(checked[key]){
  //       document.getElementById(`checkbox-${key}`).checked = true;
  //       console.log(key);
  //     }
  //   }
  // }, [checked]);

  if (pageLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 3 }}>
      <Grid
        container
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid item xs={12} md={7} lg={7}>
          <Box>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                height: "90vh",
                overflowY: "auto",
              }}
            >
              {reload ? <></> : table}
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={4.5} lg={4.5}>
          <Box>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                height: "90vh",
                overflowY: "auto",
              }}
            >
              {reload ? (
                <></>
              ) : (
                detailed_info(
                  selectedRow,
                  matches ? modalStyle : modalStyleSmall
                )
              )}
            </Card>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Messages logged successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={refreshSnack}
        autoHideDuration={6000}
        onClose={handleCloseRefresh}
      >
        <Alert
          onClose={handleCloseRefresh}
          severity="success"
          sx={{ width: "100%" }}
        >
          Chat Users reloaded successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={refreshSnackBusy}
        autoHideDuration={6000}
        onClose={handleCloseRefreshBusy}
      >
        <Alert
          onClose={handleCloseRefreshBusy}
          severity="error"
          sx={{ width: "100%" }}
        >
          User is busy, please try again later!
        </Alert>
      </Snackbar>
      <Snackbar
        open={revokedSnack}
        autoHideDuration={6000}
        onClose={handleCloseRevokedSnack}
      >
        <Alert
          onClose={handleCloseRevokedSnack}
          severity="error"
          sx={{ width: "100%" }}
        >
          User credentials have been revoked!
        </Alert>
      </Snackbar>
      <Snackbar
        open={noParticipantSnack}
        autoHideDuration={6000}
        onClose={handleCloseNoParticipantSnack}
      >
        <Alert
          onClose={handleCloseNoParticipantSnack}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Participant has been removed from the group!
        </Alert>
      </Snackbar>
      <ProgressBar open={loggingData} message={"Logging Messages..."} />
    </Box>
  );
}
