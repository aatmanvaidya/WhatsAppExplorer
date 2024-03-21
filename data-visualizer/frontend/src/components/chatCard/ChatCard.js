import SmartDisplay from "@mui/icons-material/SmartDisplay";
import constants from "../../assets/constants";
import { userPlatform } from "../../lib/isAuth";

const formatTimestamp = (timestamp) => {
    const t = new Date(timestamp);
    let hours = t.getUTCHours();
    let minutes = t.getUTCMinutes();
    let seconds = t.getUTCSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    // Find current hour in AM-PM Format
    hours = hours % 12;
    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return (
      t.toUTCString().split(" ")[0] +
      " " +
      ("0" + t.getUTCDate()).slice(-2) +
      " " +
      months[t.getUTCMonth()] +
      " " +
      t.getUTCFullYear() +
      " - " +
      ("0" + hours).slice(-2) +
      ":" +
      ("0" + minutes).slice(-2) +
      ":" +
      ("0" + seconds).slice(-2) +
      " " +
      ampm +
      " UTC"
    );
}

const ChatCard = ({ sender, metadata, uid, isMainMessage }) => {
    return <div style={{
        background: sender ? (isMainMessage ? "rgb(100, 100, 255)" : "rgb(0, 204, 255)") : "rgb(52, 202, 181)",
        maxWidth: "80%",
        padding: "10px 25px 10px 15px",
        margin: "5px 0",
        display: "flex",
        flexDirection: "column",
        alignSelf: sender ? "flex-end" : "flex-start",
        borderRadius: "15px",
        borderBottomLeftRadius: !sender ? "0px" : "15px",
        borderBottomRightRadius: sender ? "0px" : "15px",
        color: "white",
        fontWeight: "500",
        whiteSpace: "pre-line",
        wordWrap: "break-word"
    }}>
      <div style={{fontSize: "1.2rem", marginBottom: "10px", position: "relative"}}>

      {userPlatform() == "whatsapp" && metadata.senderData.forwardingScore > 0 &&
        <div style={{
          fontSize: "0.8rem", 
          fontStyle: "italic",
          textAlign: sender ? "end" : "start",
          marginBottom: (metadata.contentType!="image"&&metadata.contentType!="video") ? "5px" : "0px",
        }}>
            {metadata.senderData.forwardingScore == 127 ? ">> Forwarded Many Times" : "> Forwarded"}
        </div>
      }
      {metadata.contentType=="image" && 
          <img
            src={`${constants.baseUrl}/${localStorage.getItem("platform")}/${metadata.content}`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = constants.imgUrl;
            }}
            onClick={() => {
              window.open(`${constants.baseUrl}/${localStorage.getItem("platform")}/${metadata.content}`, '_blank');
            }}
            style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "15px", marginTop: "10px", cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: "0 0 5px rgba(0, 0, 0, 0)"}}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0)";
            }}
        />
        }
        {metadata.contentType=="video" && 
          <div
            style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "15px", marginTop: "10px", cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: "0 0 5px rgba(0, 0, 0, 0)", overflow: "hidden"}}
            onClick={() => {
              window.open(`${constants.baseUrl}/videos/${metadata.content}`, '_blank');
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0)";
            }}
          >
            <img
              src={`${constants.baseUrl}/${localStorage.getItem("platform")}/thumbnail/${metadata.content.slice(0,-4)}.jpg`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = constants.imgUrl;
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover"}}
            />
            <SmartDisplay sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "3rem", opacity: "0.8"}} />
          </div>
        }
        {(metadata.contentType!="image"&&metadata.contentType!="video") && metadata.content ? metadata.content : " "}
        </div>
      <div style={{fontSize: "0.8rem"}}>
        [{uid != 0 ? `User ${uid}` : "Sender"}] {metadata.senderData ? formatTimestamp(metadata.senderData.timestamp) : formatTimestamp(metadata.timestamp)}
      </div>
    </div>
  };
  
export default ChatCard;
  