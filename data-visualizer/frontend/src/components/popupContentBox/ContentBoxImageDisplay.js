import { isMobile } from "react-device-detect";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FlagIcon from "@mui/icons-material/Flag";

import constants from "../../assets/constants";
import { userType } from "../../lib/isAuth";
import { useEffect, useState } from "react";

const ContentBoxImageDisplay = ({
  content,
  modalData,
  viewFlagMessages,
  viewAddFlag,
  myFlag,
  removeFlag,
}) => {
  const imgUrl = `${constants.baseUrl}/${localStorage.getItem("platform")}/${content}`

  return (
    <div
      style={{
        maxHeight: isMobile ? "40vh" : "100%",
        display: "flex",
        flex: 1,
        background: "#000",
        position: "relative",
      }}
    >
      <div // todo: fix flag
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
      <img
        src={imgUrl}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = constants.imgUrl;
        }}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "contain",
          flex: 1,
        }}
      />
      <a
        href={
          isMobile
            ? `https://api.whatsapp.com/send?text=${encodeURIComponent(imgUrl)}`
            : `https://web.whatsapp.com/send?text=${encodeURIComponent(imgUrl)}`
        }
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          bottom: "0",
          right: isMobile ? "60px" : "170px",
          color: "rgba(0, 204, 255, 0.9)",
          cursor: "pointer",
        }}
      >
        <WhatsAppIcon sx={{ fontSize: isMobile ? "36px" : "50px" }} />
      </a>
      {/* <a
        href={
          isMobile
            ? `fb-messenger://share?link=${encodeURIComponent(
                imgUrl
              )}&app_id=${encodeURIComponent(constants.facebookAppId)}`
            : `http://www.facebook.com/dialog/send?app_id=${encodeURIComponent(
                constants.facebookAppId
              )}&link=${encodeURIComponent(
                imgUrl
              )}&redirect_uri=http%3A%2F%2Fwww.whats-viral.me%2F`
        }
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          bottom: "0",
          right: isMobile ? "60px" : "90px",
          color: "rgba(0, 204, 255, 0.9)",
          cursor: "pointer",
        }}
      >
        <FacebookIcon sx={{ fontSize: isMobile ? "36px" : "50px" }} />
      </a> */}
      {!isMobile && (
        <a
          href={`http://www.facebook.com/dialog/send?app_id=${encodeURIComponent(
            constants.facebookAppId
          )}&link=${encodeURIComponent(
            imgUrl
          )}&redirect_uri=http%3A%2F%2Fwww.whats-viral.me%2F`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: "0",
            right: "90px",
            color: "rgba(0, 204, 255, 0.9)",
            cursor: "pointer",
          }}
        >
          <FacebookIcon sx={{ fontSize: isMobile ? "36px" : "50px" }} />
        </a>
      )}
      <a
        href={imgUrl}
        download
        target="_blank"
        style={{
          position: "absolute",
          bottom: "0",
          right: "10px",
          color: "rgba(0, 204, 255, 0.9)",
        }}
      >
        <DownloadForOfflineIcon sx={{ fontSize: isMobile ? "36px" : "50px" }} />
      </a>
    </div>
  );
};

export default ContentBoxImageDisplay;
