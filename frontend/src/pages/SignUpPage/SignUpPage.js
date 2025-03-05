import React from 'react';
import { useNavigate} from "react-router-dom"; // Import useNavigate
import "./SignUpPage.css";

import {
  MDBContainer,
  MDBCard,
  MDBInput,
  MDBBtn,
} from 'mdb-react-ui-kit';

function SignUpPage() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <MDBContainer fluid className="signup-container">

      {/* Left Side - Image */}
      <div className="left-signup"></div>

      {/* Right Side - Login Form */}
      <div className="right-signup">
        <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>

          {/* Title */}
          <h6 className="signup-title">SIGN UP</h6>

          {/* Inputs */}
          <div className="input-signup">
            <span>Username</span>
              <MDBInput wrapperClass="input-field2" id="username" label="" type="username"/>
          </div>

          <div className="input-signup">
            <span>Email Address</span>
              <MDBInput wrapperClass="input-field2" id="email" label="" type="email"/>
          </div>

          <div className="input-signup">
            <span>Password</span>
              <MDBInput wrapperClass="input-field2" id="password" label="" type="password"/>
          </div>

          {/* Sign UP Button */}
          <div className="signup-button-container">
            <MDBBtn className="signup-button" color="dark">
              <span>SIGN UP</span>
            </MDBBtn>
          </div>

          {/* Back Button */}
          <div className="back-button-container">
            <MDBBtn className="back-button" color="dark" onClick={() => navigate(-1)}>
              <span>← Go Back</span>
            </MDBBtn>
          </div>

        </MDBCard>
      </div>
    </MDBContainer>
  );
}

export default SignUpPage;