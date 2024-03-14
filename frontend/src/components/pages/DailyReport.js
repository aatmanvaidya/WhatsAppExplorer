import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import MuiAlert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import useAuth from "../../hooks/useAuth";
import LoadingScreen from "./LoadingScreen";
// import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import FloatingButton from "../Buttons/FloatingButton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import { CSVLink } from 'react-csv';
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { Modal, IconButton, Button, Typography, Popover, Chip } from '@mui/material';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "80%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};





export default function DailyReport() {
    const [report, setReport] = useState({});
    const [finalReport, setFinalReport] = useState({});
    const [surveyModal, setSurveyModal] = useState(false);
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const [pageLoading, setPageLoading] = useState(true);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const handlePopoverOpen = (event, rowId) => {
        setPopoverAnchorEl(event.currentTarget);
        setSelectedRow(rowId);
    };

    const handlePopoverClose = () => {
        setPopoverAnchorEl(null);
        setSelectedRow(null);
    };
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("md"));

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxHeight: "80%",
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
        boxShadow: 24,
        p: 4,
    };


    useEffect(() => {
        getReport();
    }, []);

    const getReport = () => {
        const controller = new AbortController();
        const data = {
            role: auth.role,
            signal: controller.signal,
        };
        axiosPrivate
            .post("/dailyReport", data)
            .then(function (response) {
                // handle success
                // setConnectionStatus(!connectionStatus);
                setReport(response.data);
                setPageLoading(false);
                console.log(response);
            })
            .catch(function (error) {
                // handle error
                navigate("/login", { state: { from: location }, replace: true });
                console.log(error);
            })
            .then(function () {
                // always executed
                controller.abort();
            });
    };

    const handleExport = () => {
        console.log(report);
        console.log("Exported");
    }

    const table = (
        <React.Fragment>
            <CardContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">
                                    DOJ
                                </TableCell>
                                <TableCell align="right">
                                    Added By
                                </TableCell>
                                <TableCell align="right">Individual Chats</TableCell>
                                <TableCell align="right">Group Chats</TableCell>
                                <TableCell align="right">Eligible Groups</TableCell>
                                <TableCell align="right">Consented Groups</TableCell>
                                <TableCell align="right">Default Selected Groups</TableCell>
                                <TableCell align="right">Deselected Groups</TableCell>
                                <TableCell align="right">Additionally selected Groups</TableCell>
                                <TableCell align="right">Messages Logged</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(report).map((key) => (
                                <TableRow
                                    key={key}
                                    sx={{
                                        "&:last-child td, &:last-child th": { border: 0 },
                                        "&:hover": { cursor: "pointer" },
                                    }}
                                >
                                    <TableCell width="15%" component="th" scope="row">

                                        {report[key].name || "-"}
                                        <Chip
                                            icon={<SpeakerNotesIcon fontSize="small" />}
                                            label="Survey Results"
                                            onClick={(e) => handlePopoverOpen(e, key)}
                                        />
                                        <Popover
                                            open={selectedRow === key}
                                            anchorEl={popoverAnchorEl}
                                            onClose={handlePopoverClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                        >
                                            <Typography>
                                                {/* {JSON.stringify(report[key].surveyResults[0].info)}
                                                <br />
                                                {"Age : " + JSON.stringify(report[key].surveyResults[0].age)}
                                                <br />
                                                {"Religion : " + JSON.stringify(report[key].surveyResults[0].religion)}
                                                <br />
                                                {"Caste : " + JSON.stringify(report[key].surveyResults[0].caste)}
                                                <br />
                                                {"Education : " + JSON.stringify(report[key].surveyResults[0].education)}
                                                <br />
                                                {"Residental Area Type : " + JSON.stringify(report[key].surveyResults[0]["Residental area type"])}
                                                <br />
                                                {"Monthly Income : " + JSON.stringify(report[key].surveyResults[0]["Monthly Income"])}
                                                <br />
                                                {"Age : " + JSON.stringify(report[key].surveyResults[0].age)}
                                                <br />
                                                {"Religion : " + JSON.stringify(report[key].surveyResults[0].religion)}
                                                <br />
                                                {"Caste : " + JSON.stringify(report[key].surveyResults[0].caste)}
                                                <br />
                                                {"Education : " + JSON.stringify(report[key].surveyResults[0].education)}
                                                <br />
                                                {"Residental Area Type : " + JSON.stringify(report[key].surveyResults[0]["Residental area type"])}
                                                <br />
                                                {"Monthly Income : " + JSON.stringify(report[key].surveyResults[0]["Monthly Income"])}
                                                <br /> */}
                                            </Typography>
                                        </Popover>
                                    </TableCell>
                                    <TableCell width="15%" align="right">
                                        {report[key].DOJ || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].surveyor || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].totalIndividualChats || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].totalGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].eligibleGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].consentedGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].defaultSelectedGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].deselectedGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].additionalSelectedGroups || "-"}
                                    </TableCell>
                                    <TableCell width="10%" align="right">
                                        {report[key].messagesLogged || "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </React.Fragment >
    );

    if (pageLoading) {
        return <LoadingScreen />;
    }

    return (
        <Box sx={{ flexGrow: 1, mt: 3 }}>
            <Card
                sx={{
                    boxShadow: 3,
                    borderRadius: 3,
                    height: "85vh",
                    overflowY: "auto",
                }}
            >
                {table}
            </Card>
            <FloatingButton data={report} filename="Report.csv" label="Export Report" icon={<CloudDownloadIcon />} type="extended" />
        </Box>
    );
}
