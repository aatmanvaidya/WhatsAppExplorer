import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlagIcon from "@mui/icons-material/Flag";
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import axios from "axios";

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import constants from "../../assets/constants";
import isAuth, { userType } from "../../lib/isAuth";

const ContentBoxLinkDisplay = ({
  content,
  modalData,
  viewFlagMessages,
  viewAddFlag,
  myFlag,
  removeFlag,
}) => {
  
  const [urlPreviewData, setUrlPreviewData] = useState();
  // const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // console.log("hiii", content)
    if(content){
      const query = `${constants.apiBaseUrl}/misc/geturlmetadata`
      console.log(query)
      axios
        .post(query, {
          "url": content
        })
        .then((response) => {
          if(response.data){
            setUrlPreviewData(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },[content])

  return (
    <div
      style={{
        maxHeight: isMobile ? "30vh" : "100%",
        // height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        position: "relative",
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
                zIndex: 2
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
                zIndex: 2
              }}
              onClick={() => removeFlag()}
            >
              Remove Flag
            </div>
          ))}
      </div>
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            // justifyContent: "center",
            // alignItems: "center",
            // flexDirection: "column",
            // background: `url${urlPreviewData ? (urlPreviewData["images"].length > 0 ? urlPreviewData["images"][0] : constants.linkImgUrl) :  constants.linkImgUrl}`
            position: "relative",
            overflow: "hidden"
          }}
        >
          <img 
            src={urlPreviewData ? (urlPreviewData["images"].length > 0 ? urlPreviewData["images"][0] : constants.linkImgUrl) :  constants.linkImgUrl} 
            style={{
              objectFit: "cover",
              flex: 1,
              maxHeight: "100%",
              maxWidth: "100%",
            }} 
          />
          <div style={{position: "absolute", width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", bottom: 0, zIndex: 10}}>
            {urlPreviewData &&
              <>
                  { 
                    (urlPreviewData["siteName"] || urlPreviewData["title"]) &&
                    (<div style={{fontSize: "1.2rem", fontWeight: "bold", textAlign: "center", padding: "5px", background: "rgba(245,245,245,0.8)", wordBreak: "break-word"}}>
                      {urlPreviewData["siteName"] && urlPreviewData["title"] && `${urlPreviewData["siteName"]}: ${urlPreviewData["title"]}` }
                      {urlPreviewData["siteName"] && !urlPreviewData["title"] && urlPreviewData["siteName"] }
                      {!urlPreviewData["siteName"] && urlPreviewData["title"] && urlPreviewData["title"] }
                    </div>)
                  }
                  {
                    urlPreviewData["description"] &&
                    (<div style={{textAlign: "center", padding: "5px", background: "rgba(245,245,245,0.8)", wordBreak: "break-word"}}>
                      { urlPreviewData["description"] }
                    </div>)
                  }
                  {
                    !urlPreviewData["siteName"] && !urlPreviewData["title"] && !urlPreviewData["description"] &&
                    (<div style={{textAlign: "center", padding: "5px", background: "rgba(245,245,245,0.8)", wordBreak: "break-word"}}>
                      No Additional MetaData Found
                    </div>)
                  }
              </>
            }
            <a
              href={content}
              target="_blank"
              style={{
                textDecoration: "none",
                background: "rgba(0, 204, 255, 0.9)",
                padding: "5px",
                boxSizing: "border-box",
                width: "100%",
                color: "white",
                textAlign: "center",
                // whiteSpace: "nowrap",
                // overflow: "hidden",
                // textOverflow: "ellipsis",
                wordBreak: "break-word"
              }}
            >
              {content}
            </a>
          </div>
        </div>
    </div>
  );
};

export default ContentBoxLinkDisplay;
