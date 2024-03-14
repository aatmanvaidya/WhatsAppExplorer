import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import useLogout from "../../hooks/useLogout";
import useAuth from "../../hooks/useAuth";
import styled from "styled-components";
// Assets
import CloseIcon from "../../assets/svg/CloseIcon";

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Wrapper className="animate darkBg" sidebarOpen={sidebarOpen}>
      <SidebarHeader className="flexSpaceCenter">
        <div className="flexNullCenter">
          <a href="/" className="logo">
            <h1 className="whiteColor font20 extraBold" style={{ marginLeft: "15px" }}>
              <span className="text-blue-500">Whatsapp</span>Explorer
            </h1>
          </a>
        </div>
        <CloseBtn
          onClick={() => toggleSidebar(!sidebarOpen)}
          className="animate pointer"
        >
          <CloseIcon />
        </CloseBtn>
      </SidebarHeader>
      <UlStyle className="flexNullCenter flexColumn">
      {auth.role === "surveyor" || auth.role === "admin" ? (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item" href="/dashboard">
                  Dashboard
                </a>
              </li>
            ) : null}
            {auth.role === "surveyor" || auth.role === "admin" ? (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item" href="/allUsers">
                  All users
                </a>
              </li>
            ) : null}
            {auth.role === "surveyor" ? (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item" href="/addUser">
                  Add User
                </a>
              </li>
            ) : null}
            {auth.role === "admin" ? (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item" href="/allSurveyors">
                  All Surveyors
                </a>
              </li>
            ) : null}
            {auth.role === "admin" ? (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item" href="/addSurveyor">
                  Add Surveyor
                </a>
              </li>
            ) : null}
            {auth?.accessToken ? (
              <Button className='font-medium text-right rounded-md backdrop-brightness-105 p-1 text-blue-500' onClick={signOut}>Sign Out</Button>
            ) : (
              <li className="semiBold font20 pointer">
                <a className="sidenav-item"
                  href="/login"
                >
                  Log in
                </a>
              </li>
            )}
      </UlStyle>
    </Wrapper>
  );
}

const Wrapper = styled.nav`
  width: 400px;
  height: 100vh;
  position: fixed;
  top: 0;
  padding: 0 30px;
  right: ${(props) => (props.sidebarOpen ? "0px" : "-400px")};
  z-index: 9999;
  @media (max-width: 400px) {
    width: 100%;
  }
`;
const SidebarHeader = styled.div`
  padding: 20px 0;
`;
const CloseBtn = styled.button`
  border: 0px;
  outline: none;
  background-color: transparent;
  padding: 10px;
`;
const UlStyle = styled.ul`
  padding: 40px;
  li {
    margin: 20px 0;
  }
`;
