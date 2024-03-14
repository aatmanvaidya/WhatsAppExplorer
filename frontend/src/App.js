import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import LoginPage from "./components/pages/loginPage";
// import Image from "./components/ImageContainer/Image";
import AllUsers from "./components/pages/AllUsers";
import ClientLogs from "./components/pages/ClientLogs";
import Dashboard from "./components/pages/Dashboard";
import DailyReport from "./components/pages/DailyReport";
import NewUser from "./components/pages/NewUser";
import NewSurveyor from "./components/pages/NewSurveyor";
import NewIndividual from "./components/pages/NewIndividual";
import AdminNavBar from "./components/Navbar/AdminNavBar";
import AllSurveyors from "./components/pages/AllSurveyors";
import SurveyPage from "./components/pages/SurveyPage";
import Unauthorized from "./components/pages/Unauthorized";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import PersistLogin from "./components/PersistLogin";
import Home from "./components/pages/Home";
import theme from "./theme";



function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <AdminNavBar />
        {/* Add margin here */}
        <div style={{ marginTop: "80px" }}>
        </div>
        <Routes>
          <Route path="/" element={<Layout />}>
            // Accessible to all
            <Route path="/survey-form" element={<SurveyPage />} />
            {
              process.env.REACT_APP_INDIVIDUAL_USER === 'true' &&
              <Route path="/addIndividual" element={<NewIndividual />} />
            }
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client-logs" element={<ClientLogs />} />
            <Route path="/" element={<Home />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth allowedRoles={["admin"]} />}>
                // Accessible only to admin
                <Route path="addSurveyor" element={<NewSurveyor />} />
                <Route path="allSurveyors" element={<AllSurveyors />} />
                {
                  process.env.REACT_APP_DAILY_REPORT === 'true' &&
                  <Route path="daily-report" element={<DailyReport />} />
                }
              </Route>
              <Route element={<RequireAuth allowedRoles={["surveyor"]} />}>
                // Accessible only to surveyor
                <Route path="addUser" element={<NewUser />} />
              </Route>
              <Route
                element={<RequireAuth allowedRoles={["admin", "surveyor", "individual"]} />}
              >
                // Accessible to both admin and surveyor
                <Route path="allUsers" element={<AllUsers />} />
                <Route path="dashboard" element={<Dashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
