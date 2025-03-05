import React from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
import "./MainPage.css";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
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
      <div className="left-side"></div>

      {/* Right Side - Login Form */}
      <div className="right-side">
        <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>
          <MDBCardBody className="px-5 py-4 text-center">

            {/* Title */}
            <h6 className="login-title">WELCOME TO VIDEO ANALYSIS AND NOTE GENERATION SYSTEM</h6>

            {/* Inputs */}
            <div className="input-container">
              <span>Email Address</span>
                <MDBInput wrapperClass="input-field" id="email" label="" type="email"/>
            </div>

            <div className="input-container">
              <span>Password</span>
                <MDBInput wrapperClass="input-field" id="password" label="" type="password"/>
            </div>

            {/* Button */}
            <div className="button-container">
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
              Don't have an account? 
              <Link to="/signup" className="register-link">Register here
              </Link>
            </div>

          </MDBCardBody>
        </MDBCard>
      </div>

    </MDBContainer>
  );
}

export default LoginPage;