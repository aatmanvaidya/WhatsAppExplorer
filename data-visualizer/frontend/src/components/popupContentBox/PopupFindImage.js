import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { isMobile } from "react-device-detect";

const PopupFindImage = ({ handleClose, popupLoader, similarMessages }) => {
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
      {popupLoader ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
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
              Similar Messages
            </div>
            {similarMessages.map((e, KeyIcon) => {
              return (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    boxSizing: "border-box",
                    color: "black",
                    margin: "10px 0px",
                    width: "100%",
                    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
                    background: "rgba(0, 0, 0, 0.02) none repeat scroll 0% 0%"
                  }}
                >
                  <div style={{
                    padding: "10px",
                    whiteSpace: "pre-line",
                    flex: 1
                  }}>
                    {e.string}
                  </div>
                  <div style={{
                    background: "rgb(0, 204, 255)",
                    padding: "5px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontWeight: 600,
                    width: "40px"
                  }}>
                    {e.frequency}
                  </div>
                </div>
                
              );
            })}
          </div>
        </>
      )}
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

export default PopupFindImage;
