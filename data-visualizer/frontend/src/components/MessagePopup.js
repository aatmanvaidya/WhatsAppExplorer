import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const MessagePopup = (props) => {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    props.setOpen(false);
  };
  return (
    <Snackbar
      open={props.open}
      onClose={handleClose}
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={props.severity}>
        {props.message}
      </Alert>
    </Snackbar>
  );
};

export default MessagePopup;
