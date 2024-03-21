import CloseIcon from "@mui/icons-material/Close";
import { Button, CircularProgress, TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

import constants from "../../assets/constants";
import { userType } from "../../lib/isAuth";
import { SetPopupContext } from "../../pages/Layout";

import TextRow from "../TextRow";

const PopupAddFlag = ({
  handleClose,
  popupLoader,
  flagComment,
  setFlagComment,
  addFlag,
}) => {
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "30px",
          boxSizing: "border-box",
          overflow: "auto",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            marginBottom: "10px",
          }}
        >
          Flag Content
        </div>
        <TextField
          label="Reason (optional)"
          multiline
          rows={4}
          value={flagComment}
          onChange={(e) => setFlagComment(e.target.value)}
          style={{ margin: "20px 0" }}
        />
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
          <div
            style={{
              color: "white",
              padding: "10px 30px",
              background: "rgb(0, 204, 255)",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => addFlag()}
          >
            Submit
          </div>
        )}
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
  );
};

export default PopupAddFlag;
