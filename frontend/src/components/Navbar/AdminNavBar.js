import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import useLogout from "../../hooks/useLogout";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import styled from "styled-components";
// Components
import Sidebar from "../Navbar/Sidebar";
import Backdrop from "../Elements/Backdrop";
// Assets
import BurgerIcon from "../../assets/svg/BurgerIcon";

function AdminNavBar() {
  const logout = useLogout();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  const [y, setY] = useState(window.scrollY);
  const [sidebarOpen, toggleSidebar] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => setY(window.scrollY));
    return () => {
      window.removeEventListener("scroll", () => setY(window.scrollY));
    };
  }, [y]);

  // return (
  //     <div className="flex bg-blue-100 p-3 min-h-min m-1 shadow-2xl shadow-blue-200 z-50 rounded-full sticky top-1">
  //         <div>
  //             <p className='font-bold'><span className='text-blue-500'>Whatsapp</span>Explorer</p>
  //         </div>
  //         <div className='ml-auto'>
  //             <div className='flex'>
  //                 {/* <a href="/images" className='font-medium text-right mr-3'>All Users</a> */}
  //                 <Link to='/' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Home</Link>
  //                 {/* Both */}
  //                 {auth.role === "surveyor" || auth.role === "admin" ? <Link to ="/dashboard" className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Dashboard</Link> : <></>}
  //                 {auth.role === "surveyor" || auth.role === "admin" ? <Link to="/allUsers" className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>All Users</Link> : <></>}
  //                 {/* Admin */}
  //                 {auth.role === "admin" ? <Link to='/allSurveyors' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>All Surveyors</Link> : <></>}
  //                 {auth.role === "admin" ? <Link to='/addSurveyor' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Add new Surveyor</Link> : <></>}
  //                 {/* Surveyor */}
  //                 {auth.role === "surveyor" ? <Link to='/addUser' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Add new User</Link> : <></>}
  //                 {/* None */}
  //                 {/* <a href='/' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500' onClick={logout}>Logout</a> */}
  //                 {/* <a href='/' className='font-medium text-right mr-3'>Texts</a> */}
  //                 {/* <a href='/' className='font-medium text-right mr-3'>Others</a> */}
  //                 {auth?.accessToken ? <Button className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500' onClick={signOut}>Sign Out</Button> : <Link to='/login' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Login</Link>}
  //             </div>
  //         </div>
  //     </div>
  // )
  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {sidebarOpen && <Backdrop toggleSidebar={toggleSidebar} />}
      <Wrapper
        className="flexCenter animate whiteBg"
        style={y > 100 ? { height: "60px" } : { height: "80px" }}
      >
        <NavInner className="container flexSpaceCenter">
          <a href="/" className="logo">
            <h1 style={{ marginLeft: "15px" }} className="font20 extraBold">
              <span className="text-blue-500">Whatsapp</span>Explorer
            </h1>
          </a>

          <BurderWrapper
            className="pointer"
            onClick={() => toggleSidebar(!sidebarOpen)}
          >
            <BurgerIcon />
          </BurderWrapper>

          <UlWrapper className="flexNullCenter">
            {auth.role === "surveyor" || auth.role === "admin" || auth.role === "individual" ? (
              <li className="semiBold font15 pointer">
                <a href="/dashboard" style={{ padding: "10px 30px 10px 0" }}>
                  Dashboard
                </a>
              </li>
            ) : null}
            {auth.role === "surveyor" || auth.role === "admin" || auth.role === "individual" ? (
              <li className="semiBold font15 pointer">
                <a href="/allUsers" style={{ padding: "10px 30px 10px 0" }}>
                  All users
                </a>
              </li>
            ) : null}
            {auth.role === "surveyor" ? (
              <li className="semiBold font15 pointer nav-item">
                <a href="/addUser" style={{ padding: "10px 30px 10px 0" }}>
                  Add User
                </a>
              </li>
            ) : null}
            {auth.role === "admin" ? (
              <li className="semiBold font15 pointer nav-item">
                <a href="/allSurveyors" style={{ padding: "10px 30px 10px 0" }}>
                  All Surveyors
                </a>
              </li>
            ) : null}
            {auth.role === "admin" ? (
              <li className="semiBold font15 pointer nav-item">
                <a href="/addSurveyor" style={{ padding: "10px 30px 10px 0" }}>
                  Add Surveyor
                </a>
              </li>
            ) : null}
            {auth.role === "admin" && process.env.REACT_APP_DAILY_REPORT === 'true' ? (
              <li className="semiBold font15 pointer nav-item">
                <a href="/daily-report" style={{ padding: "10px 30px 10px 0" }}>
                  Report
                </a>
              </li>
            ) : null}
            {auth?.accessToken ? (
              <Button className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500' onClick={signOut}>Sign Out</Button>
            ) : (
              <>
                <li className="semiBold font15 pointer flexCenter">
                  <a
                    href="/login"
                    className="radius8 lightBg"
                    style={{ padding: "10px 15px" }}
                  >
                    Log in
                  </a>
                </li>
                {/* {process.env.REACT_APP_INDIVIDUAL_USER === 'true' ? (
                  <li className="semiBold font15 pointer nav-item">
                    <a href="/addIndividual" style={{ padding: "10px 30px 10px 0" }}>
                      Register
                    </a>
                  </li>
                ) : null} */}
              </>
            )}
          </UlWrapper>
        </NavInner>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.nav`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  margin: 0 0 3rem 0;
`;
const NavInner = styled.div`
  position: relative;
  height: 100%;
`;
const BurderWrapper = styled.button`
  outline: none;
  border: 0px;
  background-color: transparent;
  height: 100%;
  padding: 0 15px;
  display: none;
  @media (max-width: 760px) {
    display: block;
  }
`;
const UlWrapper = styled.ul`
  display: flex;
  @media (max-width: 760px) {
    display: none;
  }
`;
const UlWrapperRight = styled.ul`
  @media (max-width: 760px) {
    display: none;
  }
`;

export default AdminNavBar;
