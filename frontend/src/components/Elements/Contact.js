import React from "react";
import styled from "styled-components";
// Assets
import ContactImg1 from "../../assets/img/contact-1.png";
import ContactImg2 from "../../assets/img/contact-2.png";
import ContactImg3 from "../../assets/img/contact-3.png";

export default function Contact() {

    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [name, setName] = React.useState("");
    const [subject, setSubject] = React.useState("");
    
    const onChangeEmail = (e) => {
        setEmail(e.target.value);
    }
    const onChangeMessage = (e) => {
        setMessage(e.target.value);
    }
    const onChangeName = (e) => {
        setName(e.target.value);
    }
    const onChangeSubject = (e) => {
        setSubject(e.target.value);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();

        const body = `Name:${name}\n Email:${email}\n ${message}\n`;

        // mailto link
        const mailto = `mailto:ourmail@gmail.com?subject=${subject}&body=${body}`;
        // replace spaces with %20 and \n with %0D%0A
        const mailtoEncoded = mailto.replace(/ /g, "%20").replace(/\n/g, "%0D%0A");

        // open mailto link
        window.open(mailtoEncoded);
    }





  return (
    <Wrapper id="contact">
      <div className="lightBg">
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">About the project</h1>
            <p className="font16 mt-5">
              WhatsApp Explorer is an academic project run in collaboration between Kiran Garimella at Rutgers University and Simon Chauchard at UC3M. You can contact us at: kiran.garimella@rutgers.edu and simon.chauchard@uc3m.es.
              <br />
            </p>
	    <p className="font16 mt-5">
              WhatsApp Explorer is funded generously by the European Research Council through the POLARCHATS project. Additional support comes from Knight Foundation and the National Science Foundation.
              <br />
            </p>

          </HeaderInfo>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
`;
const HeaderInfo = styled.div`
  padding: 70px 0 0 0;
  @media (max-width: 860px) {
    text-align: center;
  }
`;
const Form = styled.form`
  padding: 70px 0 30px 0;
  input,
  textarea {
    width: 100%;
    background-color: transparent;
    border: 0px;
    outline: none;
    box-shadow: none;
    border-bottom: 1px solid #707070;
    height: 30px;
    margin-bottom: 30px;
  }
  textarea {
    min-height: 100px;
  }
  @media (max-width: 860px) {
    padding: 30px 0;
  }
`;
const ButtonInput = styled.input`
  border: 1px solid #00DFC0;
  background-color: #00DFC0;
  width: 100%;
  padding: 15px;
  outline: none;
  color: #fff;
  :hover {
    background-color: #009C86;
    border: 1px solid #009C86;
    color: #fff;
  }
  @media (max-width: 991px) {
    margin: 0 auto;
  }
`;
const ContactImgBox = styled.div`
  max-width: 180px; 
  align-self: flex-end; 
  margin: 10px 30px 10px 0;
`;
const SumbitWrapper = styled.div`
  @media (max-width: 991px) {
    width: 100%;
    margin-bottom: 50px;
  }
`;









