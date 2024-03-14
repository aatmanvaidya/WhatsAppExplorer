import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";


export default function ProgressBar({ open, message }) {

  // Position the modal in the bottom right corner of the screen
  const style = {
    position: "fixed",
    bottom: "5%",
    right: "2%",
    width: 300,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px",
  };

  if(!open){
    return (
        <></>
    )
  }
  return (
    <Box sx={style}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-around" }}>
        <CircularProgress />
        <Typography id="modal-modal-title" variant="subtitle1">
        {message}
        </Typography>
        </Stack>
    </Box>
  );
}
