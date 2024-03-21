import { isMobile } from "react-device-detect";
import FlagIcon from "@mui/icons-material/Flag";
import Linkify from 'react-linkify';

import { userType } from "../../lib/isAuth";

const ContentBoxMessageDisplay = ({
  content,
  modalData,
  viewFlagMessages,
  viewAddFlag,
  myFlag,
  removeFlag,
}) => {
  return (
    <div
      style={{
        maxHeight: isMobile ? "40vh" : "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        position: "relative",
        whiteSpace: "pre-line"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "10px",
          top: "10px",
          display: "flex",
        }}
      >
        {modalData.flagsCount > 0 && (
          <div
            style={{
              background: "#EF476F",
              padding: "7px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box",
              zIndex: 2,
              width: "60px",
              borderRadius: "10px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => viewFlagMessages()}
          >
            <FlagIcon sx={{ color: "white", fontSize: "1.3rem" }} />
          </div>
        )}
        {false && userType() == "admin" && myFlag != "NONE" && // TODO : FLAG
          (!myFlag ? (
            <div
              style={{
                background: "#EF476F",
                padding: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                borderRadius: "10px",
                cursor: "pointer",
                color: "white",
                fontWeight: "bolder",
                fontSize: "0.8rem",
              }}
              onClick={() => viewAddFlag()}
            >
              Mark Suspicious
            </div>
          ) : (
            <div
              style={{
                background: "#EF476F",
                padding: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                borderRadius: "10px",
                cursor: "pointer",
                color: "white",
                fontWeight: "bolder",
                fontSize: "0.8rem",
              }}
              onClick={() => removeFlag()}
            >
              Remove Flag
            </div>
          ))}
      </div>
      <div
        style={{
          margin: "auto",
          maxHeight: "100%",
          overflow: "auto",
          padding: "20px",
          boxSizing: "border-box",
          wordBreak: "break-word"
        }}
        className="text-hyperlink-field"
      >
        <Linkify>
        {content}
        </Linkify>
      </div>
    </div>
  );
};

export default ContentBoxMessageDisplay;
