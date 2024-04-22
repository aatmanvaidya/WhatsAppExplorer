import FlagIcon from "@mui/icons-material/Flag";
import constants from "../../assets/constants";
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


const ImgCard = ({ metadata, onClick, display }) => {
  // console.log(metadata);
  const imgUrl = `${constants.baseUrl}/${localStorage.getItem("platform")}/${metadata.content}`
  // console.log(imgUrl)

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
      {metadata.flagsCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 15,
            background: "#EF476F",
            padding: "3px 18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            borderRadius: "5px",
          }}
        >
          <FlagIcon sx={{ color: "white", fontSize: "1.3rem" }} />
        </div>
      )}
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
          flex: 1,
          overflow: "hidden",
        }}
      >
        {metadata.isExplicit == true ?
          (<div
            style={{ width: "100%", height: "100%", background: "rgba(0,0,0,1)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.3rem", fontWeight: "bolder" }}>
              PORN
          </div>)
        :
        <img
          src={imgUrl}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = constants.imgUrl;
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />}
      </div>
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
          fontSize: "1rem",
        }}
      >
        {displayData}
      </div>
    </div>
  );
};

export default ImgCard;
