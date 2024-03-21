import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { isMobile } from "react-device-detect";
import { useEffect, useState } from "react";

import ChatCard from "../chatCard/ChatCard";

const PopupMessageContext = ({ handleClose, popupLoader, currentMessage, messageContext }) => {
  const [userMapper, setUserMapper] = useState({});
  const [currentMessageId, setCurrentMessageId] = useState(-1);
  const [messages, setMessages] = useState([...messageContext["previousMessages"], ...messageContext["currentMessages"], ...messageContext["nextMessages"]]);
  
  useEffect(() => {
    messageContext["previousMessages"].reverse();
    let tmp = "";
    messageContext["currentMessages"].every((ele, index) =>{
        if(ele["content"] == currentMessage["content"]){
          tmp = ele;
          return false;
        }
        return true;
      }
    )

    const newUserMapper = {};
    let cnt = 0;
    if(currentMessage["from"]){ 
      newUserMapper[currentMessage["from"]] = cnt;
      cnt++;
    }

    const messagesTmp = [...messageContext["previousMessages"], ...messageContext["currentMessages"], ...messageContext["nextMessages"]];

    messagesTmp.every((ele, index) =>{
        if(ele == tmp){
          setCurrentMessageId(index)
          return false;
        }
        return true;
      }
    )
    
    messagesTmp.forEach(ele => {
      console.log(ele["senderData"]["from"])
    })

    messagesTmp.slice().forEach(ele => {
      if(!(ele["senderData"]["from"] in newUserMapper)){
        newUserMapper[ele["senderData"]["from"]] = cnt;
        cnt++;
      }
    })
    setMessages(messagesTmp);
    setUserMapper(newUserMapper);
    // console.log(messageContext)
  }, [messageContext]);

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
              Message Context
            </div>
            <div style={{display: "flex", flexDirection: "column"}}>
              {messages.slice().map((ele, index) => {
                return <ChatCard
                    metadata={ele}
                    sender={ele["senderData"]["from"] == currentMessage["from"]}
                    uid={userMapper[ele["senderData"]["from"]]}
                    isMainMessage={index==currentMessageId}
                  />
               }
              )}
            </div>
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

export default PopupMessageContext;
