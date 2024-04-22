import { useEffect, useState, useContext } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

import isAuth, { userSection, userRestricted } from "../../lib/isAuth";
import ContentPage from "./ContentPage";
import { SetPopupContext } from "../Layout";

import { isMobile } from "react-device-detect";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const PageLayout = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const setPopup = useContext(SetPopupContext);
  const navigate = useNavigate();

  const [syncTime, setSyncTime] = useState();

  return (
    <div style={{display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh", boxSizing: "border-box"}}>
      <div
        style={{
          // height: "8vh",
          background: "linear-gradient(-45deg, #F6FBA2, #20DED3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
        id="top-anchor"
      >
        <div
          style={{
            position: "absolute",
            left: "40px",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.8rem"
          }}>
          Latest available content: { syncTime ? (() => {
                        const t = new Date(syncTime);
                        let hours = t.getHours();
                        let minutes = t.getMinutes();
                        let seconds = t.getSeconds();
                        const ampm = t.getHours() >= 12 ? "PM" : "AM";

                        // Find current hour in AM-PM Format
                        hours = hours % 12;
                        // To display "0" as "12"
                        hours = hours ? hours : 12;
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
                        return (
                          t.toString().split(" ")[0] +
                          ", " +
                          ("0" + t.getDate()).slice(-2) +
                          " " +
                          months[t.getMonth()] +
                          " " +
                          t.getFullYear() +
                          " - " +
                          ("0" + t.getHours()).slice(-2) +
                          ":" +
                          ("0" + t.getMinutes()).slice(-2) +
                          ":" +
                          ("0" + t.getSeconds()).slice(-2) +
                          " " +
                          ampm
                        );
                      })() : "Loading..." }
        </div>

        <IconButton
          style={{
            position: "absolute",
            right: "40px",
            color: "rgb(32, 222, 211)",
            background: "#fff",
            border: "thin solid #fff",
            borderRadius: "8px",
            padding: "10px",
            cursor: "pointer",
            textAlign: "center",
            transition: "0.3s ease",

            "&:hover": {
              background: "#fff",
              color: "#20DED3", // second color of gradient
            },
          }}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("type");
            localStorage.removeItem("section");
            localStorage.removeItem("platform");
            localStorage.removeItem("restricted");
            setPopup({
              open: true,
              severity: "success",
              message: "Logged out successfully",
            });
            navigate("/login");
          }}
        >
          <LogoutIcon />
        </IconButton>

        <h1 style={{ fontSize: "30px", textAlign: "center", color: "#fff" }}>
          Whatsapp
          {
            !isMobile && " Dashboard: "+userSection()
          }
        </h1>
      </div>
      {isMobile &&
        <div style={{
          background: "rgb(0, 204, 255)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          padding: "3px",
          fontWeight: "bold"
        }}>
          {userSection()}
        </div>
      }

      {!userRestricted() && (
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          centered
          style={{ position: "sticky", top: 0, background: "white" }}
          className="tab-container"
        >
          <Tab label="Forwarded" {...a11yProps(0)} />
          <Tab label="Images" {...a11yProps(1)} />
          <Tab label="Videos" {...a11yProps(2)} />
          <Tab label="Messages" {...a11yProps(3)} />
          <Tab label="URLs" {...a11yProps(4)} />
        </Tabs>
        ) 
      }

      <TabPanel value={value} index={0} style={{overflow: "hidden", height: "100%"}}>
        <ContentPage category="forwarded" setSyncTime={setSyncTime} />
      </TabPanel>
      <TabPanel value={value} index={1} style={{overflow: "hidden", height: "100%"}}>
        <ContentPage category="images" setSyncTime={setSyncTime} />
      </TabPanel>
      <TabPanel value={value} index={2} style={{overflow: "hidden", height: "100%"}}>
        <ContentPage category="videos" setSyncTime={setSyncTime} />
      </TabPanel>
      <TabPanel value={value} index={3} style={{overflow: "hidden", height: "100%"}}>
        <ContentPage category="messages" setSyncTime={setSyncTime} />
      </TabPanel>
      <TabPanel value={value} index={4} style={{overflow: "hidden", height: "100%"}}>
        <ContentPage category="links" setSyncTime={setSyncTime} />
      </TabPanel>
    </div>
  );
};

const WaData = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth()) {
      navigate("/login");
    }
  }, []);

  return <PageLayout />;
};

export default WaData;
