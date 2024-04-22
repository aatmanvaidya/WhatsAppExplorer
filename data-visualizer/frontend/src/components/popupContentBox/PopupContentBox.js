import CloseIcon from "@mui/icons-material/Close";
import { Button, CircularProgress, LinearProgress, Modal, TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import copy from 'copy-to-clipboard';

import constants from "../../assets/constants";
import { SetPopupContext } from "../../pages/Layout";
import isAuth, { userType, userPlatform, userRestricted } from "../../lib/isAuth";

import TextRow from "../TextRow";
import ContentBoxImageDisplay from "./ContentBoxImageDisplay";
import ContentBoxVideoDisplay from "./ContentBoxVideoDisplay";
import ContentBoxLinkDisplay from "./ContentBoxLinkDisplay";
import ContentBoxMessageDisplay from "./ContentBoxMessageDisplay";
import PopupViewFlags from "./PopupViewFlags";
import PopupAddFlag from "./PopupAddFlag";
import PopupSimilarMessages from "./PopupSimilarMessages";
import PopupFindImage from "./PopupFindImage";
import PopupMessageContext from "./PopupMessageContext";
import PopupViewCaptions from "./PopupViewCaptions";

const urls = {
  images: `${constants.apiBaseUrl}/images`,
  videos: `${constants.apiBaseUrl}/videos`,
  messages: `${constants.apiBaseUrl}/messages`,
  links: `${constants.apiBaseUrl}/links`,
  forwarded: `${constants.apiBaseUrl}/forwarded`
};

const PopupContentBox = ({
  category,
  modalData,
  handleClose,
  isOpen,
  setData,
  setModalData,
  currentActiveIndex,
  filter,
  isForwarded
}) => {
  // console.log(!userRestricted() )
  // console.log(modalData);
  const setPopup = useContext(SetPopupContext);
  const [senderData, setSenderData] = useState([]);

  const [isFlagged, setIsFlagged] = useState(false);
  // useEffect(() => {
  //   setIsFlagged(modalData.isFlagged);
  // }, [modalData.isFlagged]);
  // const [flagMode, setFlagMode] = useState(false);
  // const [flagComment, setFlagComment] = useState("");

  // useEffect(() => {
  //   // Assuming you have user authentication and get the user ID somehow
  //   const userId = 'your_user_id_here';

  //   axios.get(`/messages/isflagged/${contentId}`, {
  //     headers: {
  //       'Authorization': `Bearer ${yourAccessToken}`, // Add your authentication token here
  //     },
  //     params: {
  //       contentType, // Pass the content type as a query parameter
  //     },
  //   })
  //   .then((response) => {
  //     setIsFlagged(response.data.isFlagged);
  //     setFeedback(response.data.feedback);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }, [contentId, contentType]);



  // // console.log(modalData);
  // const setFlag = () => {
  //   const data = {
  //     contentId: modalData.contentId,
  //     message: flagComment,
  //   };
  //   axios
  //     .post(`${constants.apiBaseUrl}/flags`, data, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     })
  //     .then((response) => {
  //       setPopup({
  //         open: true,
  //         severity: "success",
  //         message: response.data.message,
  //       });
  //       setIsFlagged(true);
  //       setFlagComment(data.flagMessage);
  //       setFlagMode(false);
  //     })
  //     .catch((err) => {
  //       setPopup({
  //         open: true,
  //         severity: "error",
  //         message: err.response.data.message,
  //       });
  //       console.log(err.response);
  //     });
  // };

  // const deleteFlag = () => {
  //   axios
  //     .delete(`${constants.apiBaseUrl}/flags/${modalData.contentId}`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     })
  //     .then((response) => {
  //       setPopup({
  //         open: true,
  //         severity: "success",
  //         message: response.data.message,
  //       });
  //       setIsFlagged(false);
  //       setFlagComment("");
  //     })
  //     .catch((err) => {
  //       setPopup({
  //         open: true,
  //         severity: "error",
  //         message: err.response.data.message,
  //       });
  //       console.log(err.response);
  //     });
  // };

    // view similar messages
    const [findImageOpen, setFindImageOpen] = useState(false);
    const [similarImageUrl, setSimilarImageUrl] = useState("");
    const [findImagePopupLoader, setFindImagePopupLoader] = useState(false);

    const fetchSimilarImage = () => {

      // let query = `${constants.apiBaseUrl}/messages/similarmessages?id=${modalData.id}&dateMin=${
      //   filter.minDate ? filter.minDate.toISOString() : ""
      // }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}`; 

      // axios
      //   .get(query, {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   })
      //   .then((response) => {
      //     console.log(query, response.data);
      //     setSimilarImageUrl(response.data);
      //     setFindImagePopupLoader(false);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });

    };

    const findImage = () => {
      setFindImageOpen(true);
      setFindImagePopupLoader(true);
      fetchSimilarImage();
    };

    const handleFindImageClose = () => {
      setFindImagePopupLoader(false);
      setSimilarImageUrl("");
    };

    // find image
    const [similarMessagesOpen, setSimilarMessagesOpen] = useState(false);
    const [similarMessages, setSimilarMessages] = useState([]);
    const [similarMessagesPopupLoader, setSimilarMessagesPopupLoader] = useState(false);
  
    const fetchSimilarMessages = () => {
      // console.log(filter)
      // console.log(modalData)
      // setSimilarMessages(senderData[0].similarMessages);
      // setSimilarMessagesPopupLoader(false);
      let query = `${constants.apiBaseUrl}/messages/similarmessages?id=${modalData.id}&dateMin=${
        filter.minDate ? filter.minDate.toISOString() : ""
      }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}`; 
  
      axios
        .get(query, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          // console.log(query, response.data);
          setSimilarMessages(response.data);
          setSimilarMessagesPopupLoader(false);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const viewSimilarMessages = () => {
      setSimilarMessagesOpen(true);
      setSimilarMessagesPopupLoader(true);
      fetchSimilarMessages();
    };
  
    const handleSimilarMessagesClose = () => {
      setSimilarMessagesOpen(false);
      setSimilarMessages([]);
    };
  

    // view message context
    const [messageContextOpen, setMessageContextOpen] = useState(false);
    const [messageContext, setMessageContext] = useState({"nextMessages": [], "currentMessages": [], "previousMessages": []});
    const [messageContextPopupLoader, setMessageContextPopupLoader] = useState(false);
    const [currentMessage, setCurrentMessage] = useState({});

    const fetchMessageContext = (groupName, timeStamp) => {
      // console.log(groupName, timeStamp)
      // console.log(modalData)
      // setSimilarMessages(senderData[0].similarMessages);
      // setSimilarMessagesPopupLoader(false);
      let query = `${constants.apiBaseUrl}/misc/nearmessages?groupName=${encodeURIComponent(groupName)}&timeStamp=${timeStamp}`; 
  
      axios
        .get(query, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          console.log(query, response.data);
          setMessageContext(response.data);
          setMessageContextPopupLoader(false);
        })
        .catch((error) => {
          console.log(error);
        });
    };
  
    const viewMessageContext = (groupName, timeStamp) => {
      setMessageContextOpen(true);
      setMessageContextPopupLoader(true);
      fetchMessageContext(groupName, timeStamp);
    };
  
    const handleMessageContextClose = () => {
      setMessageContextOpen(false);
      setMessageContext({"nextMessages": [], "currentMessages": [], "previousMessages": []});
      setCurrentMessage({});
    };


  // view flag messages
  const [flagMessagesOpen, setFlagMessagesOpen] = useState(false);
  const [flagMessages, setFlagMessages] = useState([]);
  const [flagMessagesPopupLoader, setFlagMessagesPopupLoader] = useState(false);

  const fetchFlagMessages = () => {
    let query = `${constants.apiBaseUrl}/flags/${modalData.id}`; // fix content id in flag
    const data = {
      id: modalData.id,
      contentType: category.slice(0, -1)
    };
    axios
      .post(query, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(query, response.data);
        setFlagMessages(response.data);
        setFlagMessagesPopupLoader(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const viewFlagMessages = () => {
    setFlagMessagesOpen(true);
    setFlagMessagesPopupLoader(true);
    fetchFlagMessages();
  };

  const handleFlagMessagesClose = () => {
    setFlagMessagesOpen(false);
    setFlagMessages([]);
  };

  // add new flag
  const [flagComment, setFlagComment] = useState("");
  const [addFlagOpen, setAddFlagOpen] = useState(false);
  const [addFlagPopupLoader, setAddFlagPopupLoader] = useState(false);

  const viewAddFlag = () => {
    setAddFlagOpen(true);
  };

  const handleAddFlagClose = () => {
    setFlagComment("");
    setAddFlagOpen(false);
  };

  const addFlag = () => {
    setAddFlagPopupLoader(true);
    let query = `${constants.apiBaseUrl}/flags`;
    const data = {
      id: modalData.id,
      contentType: category.slice(0, -1),
      message: flagComment,
    };
    // console.log(data);
    axios
      .post(query, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response)
        // reset count of element locally
        setData((data) => {
          const arr = [...data];
          arr[currentActiveIndex].flagsCount += 1;
          return arr;
        });
        setModalData({ ...modalData, flagsCount: modalData.flagsCount + 1 });
        setMyFlag(true);

        setPopup({
          open: true,
          severity: "success",
          message: "Item flagged successfully",
        });
        setAddFlagPopupLoader(false);
        handleAddFlagClose();
      })
      .catch((error) => {
        console.log(error);
        setPopup({
          open: true,
          severity: "error",
          message: error.response.data.message,
        });
        setAddFlagPopupLoader(false);
        handleAddFlagClose();
      });
  };

  // check if flagged by current user
  const [myFlag, setMyFlag] = useState("NONE");
  const checkFlagged = () => {
    let query = `${constants.apiBaseUrl}/flags/isflagged/${modalData.id}`;
    const data = {
      contentType: category.slice(0, -1),
    };
    console.log(data)
    axios
      .post(query, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      .then((response) => {
        if(response.data){
          setMyFlag(response.data.isFlagged);
          setFlagComment(response.data.feedback);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    checkFlagged();
  }, [modalData]);

  // delete flag

  const removeFlag = () => {
    let query = `${constants.apiBaseUrl}/flags/`;
    const data = {
      id: modalData.id,
      contentType: category.slice(0, -1), // handling removal of last character i.e. "s"
    };
    axios
      .delete(query, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: data,
      })
      .then((response) => {
        // console.log(response);
        // reset count of element locally
        setData((data) => {
          const arr = [...data];
          arr[currentActiveIndex].flagsCount -= 1;
          return arr;
        });
        setModalData({ ...modalData, flagsCount: modalData.flagsCount - 1 });
        setMyFlag(false);
        setPopup({
          open: true,
          severity: "success",
          message: "Item unflagged successfully",
        });
      })
      .catch((error) => {
        console.log(error);
        setPopup({
          open: true,
          severity: "error",
          message: error.response.data.message,
        });
      });
  };

  // fetch captions

  const [captions, setCaptions] = useState([]);
  const [viewCaptionsOpen, setViewCaptionsOpen] = useState(false);
  const [viewCaptionsLoader, setViewCaptionsLoader] = useState(false);

  const viewCaptions = () => {
    setViewCaptionsOpen(true);
  };

  const handleViewCaptionsClose = () => {
    setViewCaptionsOpen(false);
  };

  const fetchCaptions = () => {

    let query = `${constants.apiBaseUrl}/messages/captions?captionOf=${encodeURIComponent(modalData.content)}&isForwarded=${isForwarded}&dateMin=${
      filter.minDate ? filter.minDate.toISOString() : ""
    }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}`; 

    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setCaptions(response.data);
        setViewCaptionsLoader(false);
      })
      .catch((error) => {
        console.log(error);
      });

  };

  const copyId = async (data_id, category) => {
    try {
      let path;
      if(category == "messages"){
        path = `${constants.apiBaseUrl}/messages/id/${data_id}`;
      }
      else if(category == "videos"){
        path = `${constants.apiBaseUrl}/videos/${data_id}`
      }
      else if(category == "images"){
        path = `${constants.apiBaseUrl}/whatsapp/${data_id}`
      }
      copy(path);
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
  };

  // auto load on scroll

  const [mdDataLoader, setMdDataLoader] = useState(true);
  const [mdSkipOffset, setMdSkipOffset] = useState(0);
  const [mdFinished, setMdFinished] = useState(false);

  useEffect(() => {
    if(!isOpen){
      setSenderData([]);
      setCaptions([]);
      setViewCaptionsLoader(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if(isOpen)
      fetchMetaData();
  }, [mdSkipOffset, isOpen]);

  const fetchMetaData = () =>  {
    let query = `${urls[category]}/metaData?id=${modalData.id}&skip=${mdSkipOffset}&isForwarded=${isForwarded}&dateMin=${
      filter.minDate ? filter.minDate.toISOString() : ""
    }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}`;
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        // console.log(response.data);
        // setModalData({ ...modalData, senderData: [...modalData.senderData, ...response.data] });
        setSenderData([...senderData, ...response.data])
        setMdDataLoader(false);
        if (response.data.length == 0) setMdFinished(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (!mdFinished && offsetHeight + scrollTop >= scrollHeight) {
      setMdDataLoader(true);
      setMdSkipOffset(senderData.length);
    }
  };

  useEffect(()=>{
    if(category == "images" || category == "videos"){
      setViewCaptionsLoader(true);
      fetchCaptions();
    }
  }, [modalData]);


  return (
    <>
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
          //   justifyContent: "center",
          width: isMobile ? "90vw" : "80vw",
          overflow: "hidden",
          height: isMobile ? "80vh" : "80vh",
          position: "relative",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        
            {category == "images" && (
              <ContentBoxImageDisplay
                content={modalData.content}
                modalData={modalData}
                viewFlagMessages={viewFlagMessages}
                viewAddFlag={viewAddFlag}
                myFlag={myFlag}
                removeFlag={removeFlag}
              />
            )}
            {category == "videos" && (
              <ContentBoxVideoDisplay
                content={modalData.content}
                modalData={modalData}
                viewFlagMessages={viewFlagMessages}
                viewAddFlag={viewAddFlag}
                myFlag={myFlag}
                removeFlag={removeFlag}
              />
            )}
            {category == "messages" && (
              <ContentBoxMessageDisplay
                content={modalData.content}
                modalData={modalData}
                viewFlagMessages={viewFlagMessages}
                viewAddFlag={viewAddFlag}
                myFlag={myFlag}
                removeFlag={removeFlag}
              />
            )}
            {category == "links" && (
              <ContentBoxLinkDisplay
                content={modalData.content}
                modalData={modalData}
                viewFlagMessages={viewFlagMessages}
                viewAddFlag={viewAddFlag}
                myFlag={myFlag}
                removeFlag={removeFlag}
              />
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 0.5,
                padding: "30px",
                boxSizing: "border-box",
                overflow: "auto",
              }}
              onScroll={handleScroll}
            >
              {/* {userType() == "admin" &&
              (isFlagged ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteFlag()}
                  style={{ margin: "10px 0" }}
                >
                  Remove Flag
                </Button>
              ) : (
                <>
                  {!flagMode ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setFlagMode(!flagMode)}
                      style={{ margin: "10px 0" }}
                    >
                      Flag
                    </Button>
                  ) : (
                    <>
                      <TextField
                        label="Flag: Add Comments (Optional)"
                        multiline
                        maxRows={3}
                        value={flagComment}
                        onChange={(e) => setFlagComment(e.target.value)}
                        style={{ margin: "10px 0" }}
                      />
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => setFlag()}
                          style={{ flex: 1, marginRight: "5px" }}
                        >
                          Submit
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setFlagMode(!flagMode)}
                          style={{ flex: 1, marginLeft: "5px" }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ))} */}

              {isFlagged && (
                <TextRow
                  title="Alert"
                  style={{
                    background: "rgba( 246, 114, 128, 1)",
                    margin: "10px 0",
                  }}
                  text={`This post is flagged. ${
                    flagComment ? flagComment : ""
                  }`}
                />
              )}

              {/* {!modalData.contentType && (category == "messages")  && (
                <Button
                  variant="contained"
                  // color="error"
                  onClick={() => viewSimilarMessages()}
                  style={{ margin: "10px 0" }}
                >
                  View Similar Messages
                </Button>
              )} */}

              {/* {(category == "images")  && (
                <Button
                  variant="contained"
                  // color="error"
                  onClick={() => {
                    // window.open(`${}`, '_blank');
                  }}
                  style={{ margin: "10px 0" }}
                >
                  Search Image Online
                </Button>
              )} */}
              
              {(category == "images" || category == "videos")  &&
              (viewCaptionsLoader ? <LinearProgress /> : (captions.length > 0 && (
                <Button
                  variant="contained"
                  // color="error"
                  onClick={() => viewCaptions()}
                  style={{ margin: "10px 0" }}
                >
                  View Captions
                </Button>))
              )}

              {(category == "messages") && (
                <TextRow
                  title="Id"
                  style={{ margin: "10px 0" }}
                  text={modalData.uuid}
                  onClick={() => {copyId(modalData.uuid, category)}}
                  copy={true}
                />
              )}
              
              {(category == "images" || category == "videos") && (
                <TextRow
                  title="Name"
                  style={{ margin: "10px 0" }}
                  text={modalData.content}
                  onClick={() => {copyId(modalData.content, category)}}
                  copy={true}
                />
              )}
              
              {
                modalData.maxForwardingScore && (
                  <TextRow
                    title="Forwards"
                    style={{ margin: "10px 0" }}
                    text={(() => {
                      if(userPlatform() == "whatsapp" && modalData.maxForwardingScore == 127)
                        return "Many";
                      else
                        return modalData.maxForwardingScore;
                      })()
                    }
                  />
                )
              }
              {
                modalData.contentType && (
                  <TextRow
                    title="Content Type"
                    style={{ margin: "10px 0" }}
                    text={modalData.contentType.charAt(0).toUpperCase() +  modalData.contentType.slice(1)}
                  />
                )
              }
              <TextRow
                title="Unique Chatname Count"
                style={{ margin: "10px 0" }}
                text={modalData.uniqueChatnamesCount}
              />
              <TextRow
                title="Frequency"
                style={{ margin: "10px 0" }}
                text={modalData.frequency}
              />
              {userPlatform() != "facebook" &&
                <TextRow
                  title=""
                  style={{ margin: "10px 0", background: "white", color: "#00ccff", textAlign: "center" }}
                  text={ !userRestricted() ? "Click on the following cards below to view message context" : "Chats Details"}
                />
              }
              {/* <div 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  overflow: "auto",
                  height: isMobile ? "60vh" : "71vh",
                  position: "relative",
                }}
                onScroll={handleScroll}
              > */}
                {senderData.length == 0 && !mdDataLoader && (
                  <div style={{ padding: "40px" }}>No data found</div>
                )}
                {senderData.map((sender) => {
                  return (
                    <div
                      style={{
                        margin: "10px 0",
                        boxSizing: "border-box",
                        background: "#00ccff",
                        borderRadius: "15px",
                        cursor: (userPlatform() != "facebook" && !userRestricted() ) ? "pointer" : "auto",
                        transition: "box-shadow 0.3s ease",
                        boxShadow: "none"
                      }}
                      onClick={() => {
                        if(userPlatform() != "facebook" && !userRestricted() ){
                          setCurrentMessage({content: modalData.content, contentType: category.slice(0,-1), ...sender.senderData})
                          viewMessageContext(sender.senderData.chatname, sender.senderData.timestamp)
                        }
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)"; 
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = "none"; 
                      }}
                    >
                      {/* <TextRow title="From" text={sender.senderData.from} />
                      <TextRow title="To" text={sender.senderData.to} /> */}
                      <TextRow
                        title="ChatName"
                        text={sender.senderData.chatname}
                      />
                      <TextRow
                        title="TimeStamp"
                        text={(() => {
                          const t = new Date(sender.senderData.timestamp);
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

                        })()}
                      />
                    </div>
                  );
                })}
                {mdDataLoader && <CircularProgress style={{ padding: "15px", alignSelf: "center"}} />}
              {/* </div> */}
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
      <Modal open={similarMessagesOpen} onClose={handleSimilarMessagesClose}>
        {
          <PopupSimilarMessages
            handleClose={handleSimilarMessagesClose}
            similarMessages={similarMessages}
            popupLoader={similarMessagesPopupLoader}
          />
        }
      </Modal>
      {/* <Modal open={findImageOpen} onClose={handleFindImageClose}>
        {
          <PopupFindImage
            handleClose={handleFindImageClose}
            similarImageUrl={similarImageUrl}
            popupLoader={findImagePopupLoader}
          />
        }
      </Modal> */}
      <Modal open={flagMessagesOpen} onClose={handleFlagMessagesClose}>
        {
          <PopupViewFlags
            handleClose={handleFlagMessagesClose}
            flagMessages={flagMessages}
            popupLoader={flagMessagesPopupLoader}
          />
        }
      </Modal>
      <Modal open={addFlagOpen} onClose={handleAddFlagClose}>
        {
          <PopupAddFlag
            handleClose={handleAddFlagClose}
            flagComment={flagComment}
            setFlagComment={setFlagComment}
            addFlag={addFlag}
            popupLoader={addFlagPopupLoader}
          />
        }
      </Modal>
      <Modal open={messageContextOpen} onClose={handleMessageContextClose}>
        {
          <PopupMessageContext
            handleClose={handleMessageContextClose}
            messageContext={messageContext}
            currentMessage={currentMessage}
            popupLoader={messageContextPopupLoader}
          />
        }
      </Modal>
      <Modal open={viewCaptionsOpen} onClose={handleViewCaptionsClose}>
        {
          <PopupViewCaptions
            handleClose={handleViewCaptionsClose}
            captions={captions}
          />
        }
      </Modal>
    </>
  );
};

export default PopupContentBox;
