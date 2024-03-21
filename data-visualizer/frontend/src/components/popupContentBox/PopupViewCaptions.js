import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { isMobile } from "react-device-detect";

const PopupViewCaptions = ({ handleClose, captions }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        borderRadius: "10px",
        padding: "0px",
        outline: "none",
        display: "flex",
        width: isMobile ? "70vw" : "50vw",
        overflow: "hidden",
        maxHeight: isMobile ? "80vh" : "70vh",
        position: "relative",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "30px",
              boxSizing: "border-box",
              overflow: "auto",
              // justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "1.5rem",
                marginBottom: "10px",
              }}
            >
              Captions
            </div>
            {captions.map((e, KeyIcon) => {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px",
                    width: "100%",
                    background: "#f22952",
                    boxSizing: "border-box",
                    color: "white",
                    borderRadius: "15px",
                    fontWeight: "600",
                    margin: "10px 0px",
                    width: "100%",
                    whiteSpace: "pre-line",
                    wordWrap: "break-word",
                    textAlign: "center"
                  }}
                >
                  {e.content}
                </div>
              );
            })}
          </div>
      
      <IconButton
        style={{
          position: "absolute",
          right: "5px",
          top: "5px",
          borderRadius: "50%",
          padding: isMobile ? "5px" : "10px",
          cursor: "pointer",
          textAlign: "center",
          transition: "0.3s ease",
          background: "rgba(255,255,255,0.5)",
        }}
        onClick={() => handleClose()}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default PopupViewCaptions;
