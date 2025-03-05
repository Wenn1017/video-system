import React from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
import "./LoginPage.css";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBInput
} from "mdb-react-ui-kit";

function LoginPage() {
  const navigate = useNavigate(); // Initialize navigation hook

  // Function to handle login button click
  const handleLogin = () => {
    // You can add validation logic here (e.g., checking credentials)
    navigate("/main"); // Navigate to main page
  };

  return (
    <MDBContainer fluid className="login-container">

      {/* Left Side - Image */}
      <div className="left-login"></div>

      {/* Right Side - Login Form */}
      <div className="right-login">
        <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>

          {/* Title */}
          <h6 className="login-title">WELCOME TO VIDEO ANALYSIS AND NOTE GENERATION SYSTEM</h6>

          {/* Inputs */}
          <div className="input-login">
            <span>Email Address</span>
              <MDBInput wrapperClass="input-field1" id="email" label="" type="email"/>
          </div>

          <div className="input-login">
            <span>Password</span>
              <MDBInput wrapperClass="input-field1" id="password" label="" type="password"/>
          </div>

          {/* Button */}
          <div className="button-login">
            <MDBBtn className="login-button" color="dark">
              <span>LOG IN</span>
            </MDBBtn>
          </div>

          {/* Links */}
          {/* Register */}
          <div className="forgot-links">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          {/* Create */}
          <div className="new-account">
            Don't have an account?&nbsp; 
            <Link to="/signup" className="register-link">Register here
            </Link>
          </div>

        </MDBCard>
      </div>
    </MDBContainer>
  );
}

export default LoginPage;