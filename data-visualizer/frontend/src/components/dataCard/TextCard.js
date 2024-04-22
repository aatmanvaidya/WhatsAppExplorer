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

const TextCard = ({ metadata, onClick, display }) => {
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

  // console.log(metadata)

  return (
    <div
      style={{
        width: "100%",
        margin: "10px 20px",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
        background: "rgba(0,0,0,0.02)",
        display: "flex",
        boxSizing: "border-box",
      }}
      onClick={onClick}
    >
      <div
        style={{
          flex: 20,
          padding: "10px",
          display: "flex",
          alignItems: "center",
          whiteSpace: "pre-line",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        {metadata.content}
      </div>
      {metadata.flagsCount>0 && (
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
          flex: 0.6,
          background: "rgb(32, 222, 211)",
          fontWeight: "600",
          alignSelf: "flex-end",
          color: "white",
          padding: "13px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          fontSize: "0.85rem",
        }}
      >
        {formatTimestamp(metadata.latestTimestamp)}
      </div>
      <div
        style={{
          flex: 1.8,
          background: "#00CCFF",
          fontWeight: "600",
          alignSelf: "flex-end",
          color: "white",
          padding: "13px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        {displayData}
      </div>
    </div>
  );
};

export default TextCard;
