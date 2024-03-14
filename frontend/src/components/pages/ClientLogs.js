import axios from "../../api/axios";
import LoadingScreen from "./LoadingScreen";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";

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

export default function ClientLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/client-logs").then((res) => {
      let tokenized = tokenize_logs(res.data);
      setLogs(tokenized);
      setLoading(false);
    });
  }, []);

  const tokenize_logs = (log) => {
    let tokenized_logs = [];
    // separate logs by newlines
    let logs = log.split("\n");
    // Dates are enclosed in square brackets
    let date_regex = /\[.*?\]/;
    // Everything after : is the message
    let message_regex = /: .*/;
    // name is between ] and :
    let name_regex = /\](.*):/;

    // Iterate through each log
    for (let i = 0; i < logs.length; i++) {
      let log = logs[i];
      // continue if no date is found
      if (!log.match(date_regex)) {
        continue;
      }
      // extract date
      let date = log.match(date_regex)[0];
      date = date.substring(1, date.length - 1);
      // extract message
      let message = log.match(message_regex)[0];
      message = message.substring(2);
      // extract name
      let name = log.match(name_regex)[0];
      name = name.substring(1, name.length - 1);
      // remove whitespaces by trimming
      name = name.trim();
      message = message.trim();
      date = date.trim();

      tokenized_logs.push({
        name: name,
        message: message,
        date: date,
      });
    }

    // reverse the array so that the latest logs are at the top
    tokenized_logs.reverse();
    return tokenized_logs;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell width={'10%'} align="center" sx={{ fontWeight: 800 }}>
              Date
            </StyledTableCell>
            <StyledTableCell width={'20%'} align="center" sx={{ fontWeight: 800 }}>
              Name
            </StyledTableCell>
            <StyledTableCell width={'70%'} align="center" sx={{ fontWeight: 800 }}>
              Message
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, idx) => (
            <StyledTableRow key={idx}>
              <StyledTableCell width={'10%'} align="center">{log.date}</StyledTableCell>
              <StyledTableCell width={'20%'} align="center">{log.name}</StyledTableCell>
              <StyledTableCell width={'70%'} align="center">{log.message}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
