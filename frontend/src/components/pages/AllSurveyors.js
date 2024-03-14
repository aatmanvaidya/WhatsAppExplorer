import * as React from "react";
import PropTypes from "prop-types";
// import Box from '@mui/material/Box';
// import Collapse from '@mui/material/Collapse';
// import IconButton from '@mui/material/IconButton';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { TableRow } from "@mui/material";
// import Typography from '@mui/material/Typography';
import Paper from "@mui/material/Paper";
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import { Button } from '@mui/material';
import { styled } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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

export default function AllSurveyors() {
  const [rows, setRows] = React.useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const removeSurveyor = (username) => {
    const controller = new AbortController();
    axiosPrivate
      .post("/removeSurveyor", {
        username: username,
        signal: controller.signal,
      })
      .then((res) => {
        setRows(rows.filter((row) => row.username !== username));
        setOpen(true);
      })
      .catch((err) => {
        console.log(err);
        navigate("/login", { state: { from: location }, replace: true });
      })
      .finally(() => {
        controller.abort();
      });
  };

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    axiosPrivate
      .get("/getSurveyors", { signal: controller.signal })
      .then((res) => {
        isMounted && setRows(res.data);
      })
      .catch((err) => {
        console.log(err);
        navigate("/login", { state: { from: location }, replace: true });
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Surveyor Id
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Name
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Registered Date
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Last Active
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Users Added
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 800 }}>
              Action
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <React.Fragment key={row.username}>
              <StyledTableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                <StyledTableCell align="center" component="th" scope="row">
                  {row.username}
                </StyledTableCell>
                <StyledTableCell align="center">{row.name}</StyledTableCell>
                <StyledTableCell align="center">
                  {row.dateOfRegistration}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.lastActiveAt}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.participantsAdded.length}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {
                    <DeleteOutlineIcon
                      color="error"
                      onClick={() => removeSurveyor(row.username)}
                      sx={{ cursor: "pointer" }}
                    />
                  }
                </StyledTableCell>
              </StyledTableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Surveyor Deleted Successfully!
        </Alert>
      </Snackbar>
    </TableContainer>
  );
}
