import React from "react";
import styled from "styled-components";
// Components
import ProjectBox from "./ProjectBox";
// Assets
import ProjectImg1 from "../../assets/img/projects/1.png";
import ProjectImg2 from "../../assets/img/projects/2.png";
import ProjectImg3 from "../../assets/img/projects/3.png";
import ProjectImg4 from "../../assets/img/projects/4.png";
import ProjectImg5 from "../../assets/img/projects/5.jpg";
import ProjectImg6 from "../../assets/img/projects/6.jpg";
import AddImage2 from "../../assets/img/add/add2.png";
import { useTranslation } from 'react-i18next';

export default function Projects() {
  const { t } = useTranslation();
  return (
    <Wrapper id="projects">
      <div className="whiteBg">
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">How it works</h1>
          </HeaderInfo>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg1}
                title="User Registration"
                text="Our representatives will assist you in registering your WhatsApp account with us. Fill in basic details about you and scan the QR code presented to you from your Whatsapp application, and done!"
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg2}
                title={t('chooseThreadsToShare')}
                text="We only collect data you wish to share with us. Choose the threads you want to share with us and we will start collecting data from those threads."
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg3}
                title="Data deidentified"
                text="All data is anonymized with industry-leading anonymization tools from google, which means any personally identifiable information is not stored on our server. We periodically collect data for the duration you choose."
              />
            </div>
          </div>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg4}
                title="Dashboard stats"
                text="The interactive dashboard lists all individual chats and the groups you are part of. You may select specific chats to share with us. The dashboard also shows live updates on the number of messages logged, contacts donated, and active chat users."
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg5}
                title="Data logged regularly"
                text="We periodically collect data for the duration you choose. You may choose to stop data collection at any time. We will not store any data after the duration you choose."
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                img={ProjectImg6}
                title="Used to track misinformation"
                text="This data is then used by researchers to track the spread of misinformation and fake news on WhatsApp."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="lightBg large-mt">
        <div className="container">
          <Advertising className="flexSpaceCenter">
            <AddLeft>
              <AddLeftInner>
                <ImgWrapper className="flexCenter">
                  <img className="radius8" src={AddImage2} alt="add" />
                </ImgWrapper>
              </AddLeftInner>
            </AddLeft>
            <AddRight>
              <h2 className="font40 extraBold mb-2">What's in it for you?</h2>
              <p className="font20">
              The data you provide to the project will be useful to identify content spreading on WhatsApp, which is otherwise really difficult to access. Your data is anonymized and your personal information is never shared or even stored.
              <br />
                
              </p>
              {/* <ButtonsRow
                className="flexNullCenter"
                style={{ margin: "30px 0" }}
              >
                <div style={{ width: "190px" }}>
                  <FullButton
                    title="Get Started"
  
                  />
                </div>
                <div style={{ width: "190px", marginLeft: "15px" }}>
                  <FullButton
                    title="Contact Us"
  
                    border
                  />
                </div>
              </ButtonsRow> */}
            </AddRight>
          </Advertising>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
`;
const HeaderInfo = styled.div`
  @media (max-width: 860px) {
    text-align: center;
  }
`;
const Advertising = styled.div`
  padding: 100px 0;
  margin: 100px 0;
  position: relative;
  @media (max-width: 1160px) {
    padding: 60px 0 40px 0;
  }
  @media (max-width: 860px) {
    flex-direction: column;
    padding: 0 0 30px 0;
    margin: 80px 0 0px 0;
  }
`;
const ButtonsRow = styled.div`
  @media (max-width: 860px) {
    justify-content: space-between;
  }
`;
const AddLeft = styled.div`
  position: relative;
  width: 50%;
  p {
    max-width: 475px;
  }
  @media (max-width: 860px) {
    width: 80%;
    order: 2;
    text-align: center;
    h2 {
      line-height: 3rem;
      margin: 15px 0;
    }
    p {
      margin: 0 auto;
    }
  }
`;
const AddRight = styled.div`
  width: 50%;
  @media (max-width: 860px) {
    width: 80%;
    order: 2;
  }
`;
const AddLeftInner = styled.div`
  width: 100%;
  position: absolute;
  top: -300px;
  left: 0;
  @media (max-width: 1190px) {
    top: -250px;
  }
  @media (max-width: 920px) {
    top: -200px;
  }
  @media (max-width: 860px) {
    order: 1;
    position: relative;
    top: -60px;
    left: 0;
  }
`;
const ImgWrapper = styled.div`
  width: 100%;
  padding: 0 15%;
  img {
    width: 100%;
    height: auto;
  }
  @media (max-width: 400px) {
    padding: 0;
  }
`;
