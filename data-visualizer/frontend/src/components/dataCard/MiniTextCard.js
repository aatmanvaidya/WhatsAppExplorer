import { useState } from "react";
import FlagIcon from "@mui/icons-material/Flag";
import { userPlatform } from "../../lib/isAuth";

const formatTimestamp = (date) => {
  const t = new Date(date);
  const utcDate = new Date(Date.UTC(
    t.getUTCFullYear(),
    t.getUTCMonth(),
    t.getUTCDate(),
    t.getUTCHours(),
    t.getUTCMinutes(),
    t.getUTCSeconds()
  ));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return (
    ("0" + utcDate.getUTCDate()).slice(-2) +
    " " +
    months[utcDate.getUTCMonth()] 
  );
}

const MiniTextCard = ({ metadata, onClick, display }) => {
  let displayData = "";
  switch(display){
    case "forwarded":
      let forwardingScore = metadata.maxForwardingScore;
      if(userPlatform() == "whatsapp" && forwardingScore == 127){
        forwardingScore = "Many"
      }
      if(userPlatform() == "facebook"){
        displayData = `Likes: ${forwardingScore}`;
      }
      else{
        displayData = `Forwards: ${forwardingScore}`;
      }
      break;
    case "uniqueChats":
      displayData = `Unique ${userPlatform() == "facebook" ? "Pages/Groups" : "Chats"}: ${metadata.uniqueChatnamesCount}`;
      break;
    default:
      displayData = `Frequency: ${metadata.frequency}`;
  }

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
        margin: "20px",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
        textAlign: "center",
        display: "flex",
        padding: "8px",
        flexDirection: "column",
        position: "relative",
      }}
      onClick={onClick}
    >
      <div
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            padding: "3px 10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            borderRadius: "5px",
            background: "rgb(32, 222, 211)",
            fontWeight: "600",
            color: "white",
            fontSize: "0.85rem",
          }}
        >
          {formatTimestamp(metadata.latestTimestamp)}
      </div>
      <div
        style={{
          flex:1,
          padding: "10px",
          boxSizing: "border-box",
          display: "flex",
          overflow:"hidden",
          justifyContent: "center",
          alignItems:"center",
        }}
      >
        <div style={{ 
          whiteSpace: "pre-line",
          textAlign: "center",
          overflow: "hidden",
          margin: "auto"
        }}>
          {metadata.content}
        </div>
      </div>
      {metadata.flagsCount > 0 && (
        <div
          style={{
            background: "#FF0000",
            padding: "0 2px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <FlagIcon sx={{ color: "white", fontSize: "1.3rem" }} />
        </div>
      )}
      <div
        style={{
          background: "#00CCFF",
          fontWeight: "600",
          color: "white",
          padding: "3px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.1rem",
        }}
      >
        {displayData}
      </div>
    </div>
  );
};

export default MiniTextCard;
